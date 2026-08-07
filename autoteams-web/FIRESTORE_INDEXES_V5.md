# Firestore index required for Recommendation History

The history page queries:

```text
recommendations
WHERE workspaceId == <active workspace>
ORDER BY createdAtIso DESC
```

Firestore may prompt you to create a composite index the first time the page
is loaded.

If prompted, use the Firebase Console link in the error message.

Collection:

```text
recommendations
```

Fields:

```text
workspaceId      Ascending
createdAtIso     Descending
```

Query scope:

```text
Collection
```

You can also avoid the composite index temporarily by removing the
`orderBy("createdAtIso", "desc")` call, but the index is recommended for
production.
