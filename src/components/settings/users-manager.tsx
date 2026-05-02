"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type ManagedUserListItem } from "@/modules/auth/auth.service";
import { SettingsModal } from "./settings-modal";

type UsersManagerProps = {
  initialItems: ManagedUserListItem[];
  currentUserId: string;
};

type UserDraft = {
  id?: string;
  name: string;
  email: string;
  role: "ADMIN" | "FACTORY" | "CORPORATE";
  password: string;
  isActive: boolean;
};

const emptyDraft: UserDraft = {
  name: "",
  email: "",
  role: "FACTORY",
  password: "",
  isActive: true,
};

export function UsersManager({ initialItems, currentUserId }: UsersManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<UserDraft>(emptyDraft);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query)
    );
  }, [items, search]);

  function openCreate() {
    setDraft(emptyDraft);
    setError(null);
    setIsOpen(true);
  }

  function openEdit(item: ManagedUserListItem) {
    setDraft({
      id: item.id,
      name: item.name,
      email: item.email,
      role: item.role,
      password: "",
      isActive: item.isActive,
    });
    setError(null);
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setDraft(emptyDraft);
    setError(null);
  }

  async function readErrorMessage(response: Response, fallback: string) {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const data = (await response.json()) as { message?: string };
      return data.message ?? fallback;
    }

    const text = await response.text();
    return text.trim() || fallback;
  }

  async function saveUser() {
    setError(null);
    setIsSubmitting(true);

    try {
      const isEdit = Boolean(draft.id);
      const response = await fetch(
        isEdit ? `/api/settings/users/${draft.id}` : "/api/settings/users",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: draft.name,
            email: draft.email,
            role: draft.role,
            password: draft.password,
            isActive: draft.isActive,
          }),
        }
      );

      if (!response.ok) {
        setError(await readErrorMessage(response, "Unable to save user."));
        return;
      }

      const saved = (await response.json()) as ManagedUserListItem;

      setItems((current) => {
        const next = isEdit
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current];

        return next.sort((left, right) =>
          left.role.localeCompare(right.role) || left.name.localeCompare(right.name)
        );
      });

      closeModal();
      router.refresh();
    } catch {
      setError("Unable to save user right now. Check the server response and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleStatus(item: ManagedUserListItem) {
    setError(null);

    try {
      const response = await fetch(`/api/settings/users/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: item.name,
          email: item.email,
          role: item.role,
          password: "",
          isActive: !item.isActive,
        }),
      });

      if (!response.ok) {
        setError(await readErrorMessage(response, "Unable to update user status."));
        return;
      }

      const saved = (await response.json()) as ManagedUserListItem;
      setItems((current) =>
        current.map((candidate) => (candidate.id === saved.id ? saved : candidate))
      );
      router.refresh();
    } catch {
      setError("Unable to update user status right now. Check the server response and try again.");
    }
  }

  return (
    <>
      <DataTableShell
        title="Employee Accounts"
        description="Admins create and control real login accounts for factory and corporate employees."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative min-w-64">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                className="pl-9"
                placeholder="Search employees"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button type="button" onClick={openCreate}>
              <Plus className="size-4" aria-hidden="true" />
              Add Employee
            </Button>
          </div>
        }
      >
        {error ? (
          <div className="border-b p-4">
            <FormMessage tone="error">{error}</FormMessage>
          </div>
        ) : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length > 0 ? (
              filteredItems.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <StatusBadge status={user.isActive ? "normal" : "info"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                    }).format(new Date(user.createdAt))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => openEdit(user)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={user.isActive ? "destructive" : "outline"}
                        disabled={user.id === currentUserId}
                        onClick={() => toggleStatus(user)}
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="p-0" colSpan={6}>
                  <EmptyState
                    title="No employee accounts found"
                    description="Adjust the search or create a new employee login."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DataTableShell>

      <SettingsModal
        title={draft.id ? "Edit Employee Account" : "Add Employee Account"}
        description="Create controlled login credentials and role access for EEC employees."
        open={isOpen}
        onClose={closeModal}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="employee-name">
                Full Name
              </label>
              <Input
                id="employee-name"
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="employee-email">
                Email
              </label>
              <Input
                id="employee-email"
                type="email"
                value={draft.email}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, email: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="employee-role">
                Role
              </label>
              <SelectField
                id="employee-role"
                options={[
                  { value: "FACTORY", label: "FACTORY" },
                  { value: "CORPORATE", label: "CORPORATE" },
                  { value: "ADMIN", label: "ADMIN" },
                ]}
                value={draft.role}
                onValueChange={(nextValue) =>
                  setDraft((current) => ({
                    ...current,
                    role: nextValue as UserDraft["role"],
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="employee-password">
                {draft.id ? "New Password" : "Password"}
              </label>
              <Input
                id="employee-password"
                type="password"
                value={draft.password}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, password: event.target.value }))
                }
                placeholder={draft.id ? "Leave blank to keep current password" : "Minimum 8 characters"}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              checked={draft.isActive}
              className="size-4 rounded border-input"
              type="checkbox"
              onChange={(event) =>
                setDraft((current) => ({ ...current, isActive: event.target.checked }))
              }
            />
            Active
          </label>

          {draft.id ? (
            <FormMessage tone="info">
              Leave password blank when only updating name, email, role, or status.
            </FormMessage>
          ) : (
            <FormMessage tone="info">
              Use the employee&apos;s real email ID. The password is created here and can be changed later by admin.
            </FormMessage>
          )}

          {error ? <FormMessage tone="error">{error}</FormMessage> : null}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="button" disabled={isSubmitting} onClick={saveUser}>
              {isSubmitting ? "Saving" : draft.id ? "Save User" : "Create User"}
            </Button>
          </div>
        </div>
      </SettingsModal>
    </>
  );
}
