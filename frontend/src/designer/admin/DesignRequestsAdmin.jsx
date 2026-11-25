import { useEffect, useState } from "react"

import "./designAdmin.css"
import { formatMoney } from "../../../../shared/designPricing.js"
import {
  getDesignRequests,
  getDesignRequest,
} from "../../api/designRequests"
import DesignRequestDetail from "./DesignRequestDetail"
import {
  STATUS_LABELS,
  reference,
  formatDate,
  resizedUrl,
  contactPhone,
} from "./adminHelpers"

// ================= DASHBOARD: DESIGN REQUESTS =================
// Lazy-loaded inside the artist dashboard. Like the designer, it
// keeps its own state (list, filter, open request, renders).

function DesignRequestsAdmin({ authToken, showNotification, showConfirm }) {
  const [statusFilter, setStatusFilter] = useState("")
  const [requests, setRequests] = useState(null)
  const [listError, setListError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const [openRequest, setOpenRequest] = useState(null)

  useEffect(() => {
    let active = true
    getDesignRequests(authToken, statusFilter)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!active) return
        if (!response.ok) throw new Error(data.message || "Failed to load design requests.")
        setRequests(data.designRequests)
        setListError("")
      })
      .catch((error) => {
        if (active) setListError(error.message || "Failed to load design requests.")
      })
    return () => {
      active = false
    }
  }, [authToken, statusFilter, reloadKey])

  const open = async (id) => {
    const response = await getDesignRequest(authToken, id)
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      showNotification(data.message || "Failed to open the design request.", "error")
      return
    }
    setOpenRequest(data.designRequest)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (openRequest) {
    return (
      <div className="design-admin">
        <button type="button" className="back-button" onClick={() => setOpenRequest(null)}>
          ← All design requests
        </button>
        <DesignRequestDetail
          key={openRequest._id}
          request={openRequest}
          authToken={authToken}
          showNotification={showNotification}
          showConfirm={showConfirm}
          onChanged={(updated) => {
            setOpenRequest(updated)
            setReloadKey((key) => key + 1)
          }}
          onDeleted={() => {
            setOpenRequest(null)
            setReloadKey((key) => key + 1)
          }}
        />
      </div>
    )
  }

  return (
    <div className="design-admin">

      <div className="artist-dashboard-header">
        <h1>Design Requests</h1>
        <p>Designs customers made with "Design Your Gift Idea", newest first.</p>
      </div>

      <div className="da-toolbar">
        <label>
          Status{" "}
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <button type="button" className="da-button" onClick={() => setReloadKey((key) => key + 1)}>
          Refresh
        </button>
      </div>

      {listError && <p className="da-error" role="alert">{listError}</p>}
      {!requests && !listError && <p className="da-muted">Loading design requests...</p>}
      {requests && requests.length === 0 && (
        <p className="da-muted">No design requests{statusFilter ? ` with status "${STATUS_LABELS[statusFilter]}"` : ""} yet.</p>
      )}

      <div className="da-list">
        {requests?.map((request) => (
          <button type="button" key={request._id} className="da-card" onClick={() => open(request._id)}>
            <img src={resizedUrl(request.preview.url, 480)} alt="" loading="lazy" />
            <div className="da-card-body">
              <div className="da-card-top">
                <strong>#{reference(request)}</strong>
                <span className={`da-status da-status-${request.status}`}>{STATUS_LABELS[request.status]}</span>
              </div>
              <span className="da-card-name">{request.contact.name}</span>
              <span>
                📞 {contactPhone(request.contact) || <span className="da-muted">No number</span>}
                <span className="da-muted"> ({request.contact.hasWhatsapp ? "WhatsApp" : "no WhatsApp"})</span>
              </span>
              <span>✉️ {request.contact.email || <span className="da-muted">No email</span>}</span>
              <span className="da-muted">
                {formatMoney(request.total)} · {formatDate(request.createdAt)}
              </span>
              {request.gift?.title && <span className="da-muted">Gift: {request.gift.title}</span>}
              {request.artwork?.title && <span className="da-muted">Inspired by: {request.artwork.title}</span>}
            </div>
          </button>
        ))}
      </div>

    </div>
  )
}

export default DesignRequestsAdmin
