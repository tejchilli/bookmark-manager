"use client";

import { useEffect, useState, useCallback } from "react";
import { UserButton } from "@clerk/nextjs";

interface Bookmark {
  id: string;
  url: string;
  title: string;
  tags: string[];
  createdAt: string;
}

export default function Home() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [allAvailableTags, setAllAvailableTags] = useState<string[]>([]);

  const fetchBookmarks = useCallback(async () => {
    const params = filterTag ? `?tag=${encodeURIComponent(filterTag)}` : "";
    const res = await fetch(`/api/bookmarks${params}`);
    const data = await res.json();
    setBookmarks(data);
    setLoading(false);
  }, [filterTag]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // Fetch all tags (unfiltered) so the filter bar always shows every tag
  useEffect(() => {
    fetch("/api/bookmarks")
      .then((res) => res.json())
      .then((data: Bookmark[]) => {
        setAllAvailableTags([...new Set(data.flatMap((b) => b.tags))].sort());
      });
  }, [bookmarks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, title, tags }),
    });

    setUrl("");
    setTitle("");
    setTagsInput("");
    fetchBookmarks();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/bookmarks/${id}`, { method: "DELETE" });
    fetchBookmarks();
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Bookmark Manager</h1>
        <UserButton />
      </div>

      {/* Add Bookmark Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-3">
        <div className="flex gap-3">
          <input
            type="url"
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Tags (comma-separated)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Add
          </button>
        </div>
      </form>

      {/* Tag Filter */}
      {allAvailableTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500 mr-1">Filter:</span>
          <button
            onClick={() => setFilterTag("")}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filterTag === ""
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            All
          </button>
          {allAvailableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filterTag === tag
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Bookmark List */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : bookmarks.length === 0 ? (
        <p className="text-gray-500">
          {filterTag
            ? `No bookmarks tagged "${filterTag}".`
            : "No bookmarks yet. Add one above!"}
        </p>
      ) : (
        <ul className="space-y-3">
          {bookmarks.map((bookmark) => (
            <li
              key={bookmark.id}
              className="flex items-start justify-between gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
            >
              <div className="min-w-0">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium break-all"
                >
                  {bookmark.title}
                </a>
                <p className="text-sm text-gray-500 break-all mt-0.5">
                  {bookmark.url}
                </p>
                {bookmark.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {bookmark.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDelete(bookmark.id)}
                className="text-red-500 hover:text-red-700 text-sm shrink-0 mt-0.5"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
