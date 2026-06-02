"use client";

import { useState, useRef, useEffect } from "react";
import type { ResourceType } from "@/lib/types";

interface FieldProps {
  resourceId: string;
  field: "why_i_like_this" | "inspiration_notes";
  initialValue: string | null;
  label: string;
  emptyText: string;
}

function EditableField({ resourceId, field, initialValue, label, emptyText }: FieldProps) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(initialValue ?? "");
  const [draft, setDraft] = useState(initialValue ?? "");
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [editing]);

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`/api/resources/${resourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: draft.trim() || null }),
      });
      setSaved(draft.trim());
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const cancel = () => {
    setDraft(saved);
    setEditing(false);
  };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span className="eyebrow" style={{ fontSize: "0.72em" }}>{label}</span>
        {!editing && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "0.78em", height: 26, padding: "0 10px" }}
            onClick={() => setEditing(true)}
          >
            {saved ? "Edit" : "Add"}
          </button>
        )}
      </div>

      {editing ? (
        <div>
          <textarea
            ref={ref}
            value={draft}
            onChange={e => {
              setDraft(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onKeyDown={e => {
              if (e.key === "Escape") cancel();
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") save();
            }}
            placeholder={emptyText}
            style={{
              width: "100%",
              minHeight: 80,
              padding: "10px 12px",
              background: "var(--secondary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              fontSize: "0.95em",
              lineHeight: 1.65,
              resize: "none",
              fontFamily: "inherit",
              color: "var(--foreground)",
              outline: "none",
              display: "block",
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={cancel}>
              Cancel
            </button>
            <span style={{ fontSize: "0.74em", color: "var(--ds-fg-subtle)" }}>⌘↵ to save</span>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setEditing(true)}
          style={{
            fontSize: "0.95em",
            lineHeight: 1.65,
            color: saved ? "var(--foreground)" : "var(--ds-fg-subtle)",
            cursor: "text",
            whiteSpace: "pre-wrap",
          }}
        >
          {saved || emptyText}
        </div>
      )}
    </div>
  );
}

interface Props {
  resourceId: string;
  initialType: ResourceType;
  whyILikeThis: string | null;
  inspirationNotes: string | null;
  tint: string;
}

export function ReferenceNotes({ resourceId, initialType, whyILikeThis, inspirationNotes, tint }: Props) {
  const [type, setType] = useState<ResourceType>(initialType);
  const [toggling, setToggling] = useState(false);

  const toggleType = async () => {
    const next: ResourceType = type === "reference" ? "resource" : "reference";
    setToggling(true);
    try {
      await fetch(`/api/resources/${resourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: next }),
      });
      setType(next);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div style={{ marginTop: 32, paddingTop: 28, borderTop: "1px solid var(--border)" }}>
      {/* Type toggle row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: type === "reference" ? 28 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {type === "reference" && (
            <span style={{
              fontFamily: "var(--font-jetbrains-mono, monospace)",
              fontSize: "0.65em",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              background: tint,
              color: "#fff",
              padding: "2px 7px",
              borderRadius: 4,
            }}>
              Reference
            </span>
          )}
          <span style={{ fontSize: "0.84em", color: "var(--ds-fg-subtle)" }}>
            {type === "reference" ? "A product that inspires you" : "Save as a reference to capture what you love about it"}
          </span>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ fontSize: "0.78em", height: 26, padding: "0 10px", flexShrink: 0 }}
          onClick={toggleType}
          disabled={toggling}
        >
          {toggling ? "…" : type === "reference" ? "Remove reference" : "Mark as reference"}
        </button>
      </div>

      {type === "reference" && (
        <>
          <EditableField
            resourceId={resourceId}
            field="why_i_like_this"
            initialValue={whyILikeThis}
            label="Why I Like This"
            emptyText="Add a note about why this inspires you."
          />
          <EditableField
            resourceId={resourceId}
            field="inspiration_notes"
            initialValue={inspirationNotes}
            label="Inspiration Notes"
            emptyText="No inspiration notes yet."
          />
        </>
      )}
    </div>
  );
}
