"use client";

import { softDeleteAccountAction } from "@/app/(service)/settings/actions";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import { useState } from "react";

export function DeleteAccountForm() {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="danger"
        onClick={() => setConfirming(true)}
      >
        <Trash2 className="size-4" />
        Delete account
      </Button>
    );
  }

  return (
    <form
      action={softDeleteAccountAction}
      className="rounded-md border border-danger/35 bg-danger/10 p-3"
    >
      <input type="hidden" name="confirmDelete" value="DELETE" />
      <p className="text-sm font-medium text-danger">Delete this account?</p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-fg-muted">
        This signs you out and marks the profile inactive for the prototype.
        Saved games stay in storage for now.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button type="submit" variant="danger" size="sm">
          <Trash2 className="size-4" />
          Confirm delete
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setConfirming(false)}
        >
          <X className="size-4" />
          Keep account
        </Button>
      </div>
    </form>
  );
}
