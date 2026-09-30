import { MessageThread } from "@/components/my/my-ui";
import { getMessages, requireMyAudit } from "@/lib/customer";

export default async function MessagesPage() {
  const audit = await requireMyAudit();
  const messages = await getMessages(audit.id);
  return (
    <div className="my-page">
      <header className="my-head">
        <p className="my-kicker">Messages</p>
        <h1>Talk to us<span>.</span></h1>
        <p>A real person reads and replies within 24 hours. {audit.email ? `We also email ${audit.email} when we reply.` : "Add your email in My details and we will email you when we reply."}</p>
      </header>
      <MessageThread messages={messages} firstName={audit.name.trim().split(/\s+/)[0]} />
    </div>
  );
}
