import { useState } from "react"

type Props = {
  stripeSubscriptionId: string
  externalId: string
  hoxtonStatus: string
  cancelAtPeriodEnd: boolean
  reviewStatus: string
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

  // 🚫 ID verification not done: no cancel button
  if (reviewStatus === "NO_ID") {
    return (
      <p className="text-sm text-gray-500">
        📩 You haven’t completed identity verification yet. 
        If you wish to cancel your subscription, please contact support at{" "}
        <a href="mailto:support@betaoffice.uk" className="underline text-blue-600">
          support@betaoffice.uk
        </a>.
      </p>
    )
  }

  if (cancelAtPeriodEnd) {
    return (
      <p className="text-sm text-gray-500">
        📅 You’ve already scheduled cancellation at the end of this term.
      </p>
    )
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
