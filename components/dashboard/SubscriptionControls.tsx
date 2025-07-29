import { useState } from "react"

type Props = {
  stripeSubscriptionId: string
  externalId: string
  hoxtonStatus: string
  cancelAtPeriodEnd: boolean
  reviewStatus: string // e.g. "NO_ID", "PENDING", "ACTIVE"
}

export default function SubscriptionControls({
  stripeSubscriptionId,
  externalId,
  hoxtonStatus,
  cancelAtPeriodEnd,
  reviewStatus,
}: Props) {
  const [loading, setLoading] = useState(false)

  const cancel = async () => {
    if (reviewStatus === "NO_ID") {
      const confirm = window.confirm(
        "Your identity has not been verified yet. Cancelling now will revoke your access. Are you sure?"
      )
      if (!confirm) return
    } else {
      const confirm = window.confirm("Are you sure you want to cancel your subscription?")
      if (!confirm) return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/backend/cancel-at-period-end", {
        method: "POST",
        body: JSON.stringify({ stripe_subscription_id: stripeSubscriptionId }),
        headers: { "Content-Type": "application/json" },
      })
      if (!res.ok) throw new Error("Cancellation failed")
      alert("✅ Your subscription will end at the end of this billing period.")
    } catch (err) {
      console.error(err)
      alert("❌ Failed to cancel. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const restart = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/backend/start-subscription", {
        method: "POST",
        body: JSON.stringify({ external_id: externalId }),
        headers: { "Content-Type": "application/json" },
      })
      if (!res.ok) throw new Error("Restart failed")
      alert("✅ Subscription restarted.")
    } catch (err) {
      console.error(err)
      alert("❌ Could not restart. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  if (cancelAtPeriodEnd) {
    return <p className="text-sm text-gray-500">📅 You’ve already scheduled cancellation at the end of this term.</p>
  }

  if (hoxtonStatus === "stopped") {
    return (
      <button
        onClick={restart}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Restarting..." : "🔁 Restart Subscription"}
      </button>
    )
  }

  return (
    <button
      onClick={cancel}
      disabled={loading}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      {loading ? "Cancelling..." : "📅 Cancel at Period End"}
    </button>
  )
}
