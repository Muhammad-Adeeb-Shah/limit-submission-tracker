from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from submissions import models


def _seed():
    """Create a minimal but realistic dataset for tests."""
    broker_a = models.Broker.objects.create(name="Alpha Brokerage", primary_contact_email="a@alpha.com")
    broker_b = models.Broker.objects.create(name="Beta Brokerage", primary_contact_email="b@beta.com")
    company_a = models.Company.objects.create(legal_name="Acme Corp", industry="Tech", headquarters_city="NYC")
    company_b = models.Company.objects.create(legal_name="Globex Inc", industry="Finance", headquarters_city="LA")
    owner = models.TeamMember.objects.create(full_name="Jane Doe", email="jane@example.com")

    sub1 = models.Submission.objects.create(
        company=company_a, broker=broker_a, owner=owner,
        status="new", priority="high", summary="First submission",
    )
    sub2 = models.Submission.objects.create(
        company=company_b, broker=broker_b, owner=owner,
        status="in_review", priority="medium", summary="Second submission",
    )
    sub3 = models.Submission.objects.create(
        company=company_a, broker=broker_b, owner=owner,
        status="closed", priority="low", summary="Third submission",
    )

    models.Contact.objects.create(submission=sub1, name="Alice", role="CEO", email="alice@acme.com", phone="555-1234")
    models.Document.objects.create(submission=sub1, title="Policy.pdf", doc_type="policy", file_url="https://example.com/policy.pdf")
    models.Document.objects.create(submission=sub1, title="App.pdf", doc_type="application", file_url="https://example.com/app.pdf")
    models.Note.objects.create(submission=sub1, author_name="Jane Doe", body="Looks good, moving forward.")
    models.Note.objects.create(submission=sub2, author_name="Jane Doe", body="Needs more info.")

    return {
        "broker_a": broker_a, "broker_b": broker_b,
        "company_a": company_a, "company_b": company_b,
        "owner": owner, "sub1": sub1, "sub2": sub2, "sub3": sub3,
    }


class SubmissionListTests(TestCase):
    """Tests for GET /api/submissions/ — filtering, pagination, serialization."""

    def setUp(self):
        self.client = APIClient()
        self.data = _seed()

    def test_list_returns_paginated_results(self):
        resp = self.client.get("/api/submissions/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("results", resp.data)
        self.assertIn("count", resp.data)
        self.assertEqual(resp.data["count"], 3)

    def test_list_includes_nested_relations(self):
        resp = self.client.get("/api/submissions/")
        first = resp.data["results"][0]
        self.assertIn("broker", first)
        self.assertIn("company", first)
        self.assertIn("owner", first)
        self.assertIn("name", first["broker"])
        self.assertIn("legal_name", first["company"])
        self.assertIn("full_name", first["owner"])

    def test_list_includes_counts_and_latest_note(self):
        resp = self.client.get("/api/submissions/")
        items = {item["id"]: item for item in resp.data["results"]}
        sub1 = items[self.data["sub1"].pk]
        self.assertEqual(sub1["document_count"], 2)
        self.assertEqual(sub1["note_count"], 1)
        self.assertIsNotNone(sub1["latest_note"])
        self.assertEqual(sub1["latest_note"]["author_name"], "Jane Doe")

    # ── Filter tests ────────────────────────────────────────────────

    def test_filter_by_status(self):
        resp = self.client.get("/api/submissions/", {"status": "new"})
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(resp.data["results"][0]["status"], "new")

    def test_filter_by_status_case_insensitive(self):
        resp = self.client.get("/api/submissions/", {"status": "NEW"})
        self.assertEqual(resp.data["count"], 1)

    def test_filter_by_broker_id(self):
        resp = self.client.get("/api/submissions/", {"broker_id": self.data["broker_b"].pk})
        self.assertEqual(resp.data["count"], 2)

    def test_filter_by_company_search(self):
        resp = self.client.get("/api/submissions/", {"company_search": "acme"})
        self.assertEqual(resp.data["count"], 2)

    def test_filter_by_company_search_partial(self):
        resp = self.client.get("/api/submissions/", {"company_search": "glob"})
        self.assertEqual(resp.data["count"], 1)

    def test_filter_has_documents_true(self):
        resp = self.client.get("/api/submissions/", {"has_documents": "true"})
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(resp.data["results"][0]["id"], self.data["sub1"].pk)

    def test_filter_has_documents_false(self):
        resp = self.client.get("/api/submissions/", {"has_documents": "false"})
        self.assertEqual(resp.data["count"], 2)

    def test_filter_has_notes_true(self):
        resp = self.client.get("/api/submissions/", {"has_notes": "true"})
        self.assertEqual(resp.data["count"], 2)

    def test_filter_has_notes_false(self):
        resp = self.client.get("/api/submissions/", {"has_notes": "false"})
        self.assertEqual(resp.data["count"], 1)

    def test_filter_combined(self):
        resp = self.client.get("/api/submissions/", {
            "broker_id": self.data["broker_b"].pk,
            "company_search": "globex",
        })
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(resp.data["results"][0]["id"], self.data["sub2"].pk)

    def test_filter_no_match(self):
        resp = self.client.get("/api/submissions/", {"company_search": "nonexistent"})
        self.assertEqual(resp.data["count"], 0)
        self.assertEqual(resp.data["results"], [])


class SubmissionDetailTests(TestCase):
    """Tests for GET /api/submissions/<id>/ — nested relations, 404."""

    def setUp(self):
        self.client = APIClient()
        self.data = _seed()

    def test_detail_returns_full_submission(self):
        resp = self.client.get(f"/api/submissions/{self.data['sub1'].pk}/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["id"], self.data["sub1"].pk)
        self.assertIn("contacts", resp.data)
        self.assertIn("documents", resp.data)
        self.assertIn("notes", resp.data)

    def test_detail_includes_nested_contacts(self):
        resp = self.client.get(f"/api/submissions/{self.data['sub1'].pk}/")
        self.assertEqual(len(resp.data["contacts"]), 1)
        self.assertEqual(resp.data["contacts"][0]["name"], "Alice")

    def test_detail_includes_nested_documents(self):
        resp = self.client.get(f"/api/submissions/{self.data['sub1'].pk}/")
        self.assertEqual(len(resp.data["documents"]), 2)

    def test_detail_includes_nested_notes(self):
        resp = self.client.get(f"/api/submissions/{self.data['sub1'].pk}/")
        self.assertEqual(len(resp.data["notes"]), 1)
        self.assertEqual(resp.data["notes"][0]["author_name"], "Jane Doe")

    def test_detail_404_for_missing_id(self):
        resp = self.client.get("/api/submissions/99999/")
        self.assertEqual(resp.status_code, 404)


class BrokerEndpointTests(TestCase):
    """Tests for GET /api/brokers/ — flat list, no pagination."""

    def setUp(self):
        self.client = APIClient()
        self.data = _seed()

    def test_broker_list_returns_flat_array(self):
        resp = self.client.get("/api/brokers/")
        self.assertEqual(resp.status_code, 200)
        self.assertIsInstance(resp.data, list)
        self.assertEqual(len(resp.data), 2)

    def test_broker_list_not_paginated(self):
        resp = self.client.get("/api/brokers/")
        # Should be a flat list, not a dict with 'results'
        self.assertNotIsInstance(resp.data, dict)


class QueryOptimizationTests(TestCase):
    """Verify select_related/prefetch_related reduce query counts."""

    def setUp(self):
        self.client = APIClient()
        self.data = _seed()

    def test_list_query_count(self):
        # Without select_related, 3 submissions × 3 FKs = 9 extra queries.
        # With select_related, the FK joins collapse into 1 query.
        # Expected: 1 count query + 1 data query (with JOINs) = 2 total.
        with self.assertNumQueries(2):
            self.client.get("/api/submissions/")

    def test_detail_query_count(self):
        # select_related(broker, company, owner) = 1 query
        # prefetch_related(contacts, documents, notes) = 3 queries
        # Total: 4
        with self.assertNumQueries(4):
            self.client.get(f"/api/submissions/{self.data['sub1'].pk}/")
