"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Headset, Plus, Ticket } from "lucide-react";
import { useApiResource } from "@/hooks/use-api-resource";
import { displayDate, queryPath } from "@/lib/api";
import {
  ticketCategories,
  ticketPriorities,
  ticketReference,
  ticketStatuses,
  ticketStatusLabel,
  type TicketStatus,
  type SupportTicket,
} from "@/lib/support";
import { SupportError, SupportLoading, TicketBadge } from "./support-ui";

const PAGE_SIZE = 20;
export default function SupportBoard({ admin = false }: { admin?: boolean }) {
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const base = admin ? "/admin/support" : "/support";
  const tickets = useApiResource<{ items: SupportTicket[]; total: number }>(
    queryPath(base, { status, offset, limit: PAGE_SIZE }),
    { items: [], total: 0 },
    30000,
  );
  return (
    <div className="support-page">
      <header className="support-header">
        <div className="support-heading">
          <span className="support-heading-icon">
            <Headset size={24} />
          </span>
          <div>
            <h1>{admin ? "Support tickets" : "Help & support"}</h1>
            <p>
              {admin
                ? "Help members, follow up on issues, and keep conversations moving."
                : "Get help with your account, referrals, or anything on LaidOffCircle."}
            </p>
          </div>
        </div>
        {!admin && (
          <Link className="primary support-primary" href="/support/new">
            <Plus size={17} /> New ticket
          </Link>
        )}
      </header>
      {!admin && (
        <div className="support-intro card">
          <Ticket size={20} />
          <div>
            <h2>A place to get things sorted</h2>
            <p>
              Tell us what happened and track the conversation here. Your
              tickets are private and only visible to you and our support team.
            </p>
          </div>
        </div>
      )}
      <section
        className="support-list card"
        aria-label={admin ? "Support queue" : "Your support tickets"}
      >
        <div className="support-toolbar">
          <h2>
            {admin ? "Ticket queue" : "Your tickets"}{" "}
            <span>{tickets.data.total}</span>
          </h2>
          <label>
            Status
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setOffset(0);
              }}
            >
              <option value="">All statuses</option>
              {Object.keys(ticketStatuses).map((value) => (
                <option value={value} key={value}>
                  {ticketStatusLabel(value as TicketStatus, admin)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {tickets.error && (
          <SupportError
            message={tickets.error}
            retry={() => void tickets.reload()}
          />
        )}
        {tickets.loading ? (
          <SupportLoading />
        ) : !tickets.error && tickets.data.items.length === 0 ? (
          <div className="support-empty">
            <Ticket size={32} />
            <h3>
              {status
                ? "No tickets with this status"
                : admin
                  ? "No support tickets yet"
                  : "You’re all caught up"}
            </h3>
            <p>
              {status
                ? "Choose another status to see more tickets."
                : admin
                  ? "New member requests will appear here."
                  : "When you need a hand, create a ticket and we’ll help you from here."}
            </p>
          </div>
        ) : (
          <div className="support-ticket-list">
            {tickets.data.items.map((ticket) => (
              <Link
                href={`${base}/${ticket.id}`}
                className="support-ticket-row"
                key={ticket.id}
              >
                <div className="support-ticket-summary">
                  <div className="support-ticket-meta">
                    <span>{ticketReference(ticket.id)}</span>
                    <span>{ticketCategories[ticket.category]}</span>
                  </div>
                  <h3>{ticket.subject}</h3>
                  <p>
                    {admin
                      ? `${ticket.requesterName} · ${ticket.requesterEmail}`
                      : `Updated ${displayDate(ticket.updatedAt)}`}
                  </p>
                </div>
                <div className="support-ticket-side">
                  <TicketBadge status={ticket.status} admin={admin} />
                  <span
                    className={`support-priority support-priority-${ticket.priority}`}
                  >
                    {ticketPriorities[ticket.priority]} priority
                  </span>
                </div>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
        {!tickets.loading && (offset > 0 || tickets.data.total > PAGE_SIZE) && (
          <nav className="support-pagination" aria-label="Ticket pages">
            <button
              type="button"
              disabled={offset === 0}
              onClick={() =>
                setOffset((value) => Math.max(0, value - PAGE_SIZE))
              }
            >
              <ArrowLeft size={15} /> Previous
            </button>
            <span>Page {Math.floor(offset / PAGE_SIZE) + 1}</span>
            <button
              type="button"
              disabled={offset + PAGE_SIZE >= tickets.data.total}
              onClick={() => setOffset((value) => value + PAGE_SIZE)}
            >
              Next <ArrowRight size={15} />
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
