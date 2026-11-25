import PhoneWithWhatsapp from "../components/PhoneWithWhatsapp"

import {
  getArtworkImageUrl,
} from "../utils/images"

// ================= CUSTOM REQUESTS =================

function CustomRequestsSection({
  customRequests,
  updateRequestStatus,
  deleteCustomRequest,
}) {
  return (
    <>

      <div className="artist-dashboard-header">

        <h1>
          Customized Art Requests
        </h1>

        <p>
          Manage customer customized MicroArt requests.
        </p>

      </div>


      {customRequests.length === 0 ? (

        <div className="empty-dashboard">

          <h2>
            No Custom Requests
          </h2>

          <p>
            There are currently no customized artwork requests.
          </p>

        </div>

      ) : (

        <div className="custom-requests-list">

          {customRequests.map((request) => (

            <article
              className="custom-request-card"
              key={request._id}
            >

              {request.artworkId?.image && (

                <div className="request-artwork-image">

                  <img
                    src={getArtworkImageUrl(request.artworkId.image)}
                    alt={request.artworkId.title}
                  />

                </div>

              )}


              <h2>
                {request.fullName}
              </h2>


              <p>
                <strong>Phone:</strong>{" "}
                <PhoneWithWhatsapp
                  phone={request.phone}
                  hasWhatsapp={request.hasWhatsapp}
                />
              </p>


              <p>
                <strong>Email:</strong>{" "}
                {request.email}
              </p>


              <p>
                <strong>Type:</strong>{" "}
                {request.requestType === "contact"
                  ? "General Contact"
                  : "Customized Art Request"}
              </p>


              <p>
                <strong>
                  {request.requestType === "contact"
                    ? "Reason:"
                    : "Request:"}
                </strong>{" "}
                {request.requestDetails ||
                  "No reason provided"}
              </p>


              <p>
                <strong>Artwork:</strong>{" "}
                {request.artworkId?.title ||
                  (request.requestType === "contact"
                    ? "Not applicable"
                    : "New custom idea")}
              </p>


              <p>
                <strong>Submitted:</strong>{" "}
                {new Date(
                  request.createdAt
                ).toLocaleString()}
              </p>


              <div className="request-status">

                <label>
                  <strong>Status:</strong>
                </label>

                <select
                  value={request.status}
                  onChange={(event) =>
                    updateRequestStatus(
                      request._id,
                      event.target.value
                    )
                  }
                >

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>

                </select>


              </div>

              <div className="request-actions">
                <button
                  type="button"
                  className="delete-request-btn"
                  onClick={() => deleteCustomRequest(request._id)}
                >
                  Delete Request
                </button>
              </div>

            </article>


          ))}

        </div>

      )}

    </>
  )
}

export default CustomRequestsSection
