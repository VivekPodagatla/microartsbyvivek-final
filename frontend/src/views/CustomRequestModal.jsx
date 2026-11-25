import {
  createCustomRequest,
} from "../api/customRequests"
import PhoneFields from "../components/PhoneFields"
import ConsentCheckbox from "../components/ConsentCheckbox"

// ================= CUSTOM REQUEST MODAL =================

function CustomRequestModal({
  requestFormType,
  customRequestArtwork,
  setShowRequestForm,
  setRequestSubmitted,
  setCustomRequestArtwork,
  setRequestFormType,
  requestSubmitted,
  showNotification,
  openDesigner,
}) {
  return (
    <div className="request-modal">

      <div className="request-modal-content">

        {requestFormType === "custom-art" &&
          customRequestArtwork && (
            <p>
              Requesting customization for:{" "}
              <strong>
                {customRequestArtwork.title}
              </strong>
            </p>
          )}

        <button
          className="close-modal"
          onClick={() => {
            setShowRequestForm(false)
            setRequestSubmitted(false)
            setCustomRequestArtwork(null)
            setRequestFormType("custom-art")
          }}
        >
          ×
        </button>

        {!requestSubmitted ? (

          <>

            <h2>
              {requestFormType === "contact"
                ? "Contact the Artist"
                : "Request Customized Art"}
            </h2>

            <p>
              {requestFormType === "contact"
                ? "Enter your contact details below. You can also describe your reason for contacting the artist."
                : "Enter your details and describe the customized MicroArt you would like."}
            </p>

            {requestFormType === "custom-art" && (
              <div className="design-idea-row">
                <span>Rather show it than describe it?</span>
                <button
                  type="button"
                  className="design-idea-button"
                  onClick={openDesigner}
                >
                  Design Your Gift Idea
                </button>
              </div>
            )}

            <form
              className="custom-request-form"
              onSubmit={async (event) => {
                event.preventDefault()

                const form = event.currentTarget

                const formData = new FormData(form)

                const requestData = {
                  fullName:
                    formData.get("fullName"),

                  countryCode:
                    formData.get("countryCode"),

                  phone:
                    formData.get("phone"),

                  hasWhatsapp:
                    formData.get("hasWhatsapp") === "on",

                  consent:
                    formData.get("consent") === "on",

                  email:
                    formData.get("email"),

                  requestDetails:
                    formData.get("requestDetails") || "",

                  requestType:
                    requestFormType,

                  artworkId:
                    requestFormType === "custom-art"
                      ? customRequestArtwork?._id
                      : null,
                }

                try {
                  const response = await createCustomRequest(
                    requestData
                  )

                  const data = await response.json()

                  if (!response.ok) {
                    showNotification(data.message || "Failed to submit request")
                    return
                  }

                  setRequestSubmitted(true)
                } catch (error) {
                  console.error("Custom request submission error:", error)

                  showNotification(
                    "Unable to submit your request. Please try again."
                  )
                }
              }}
            >

              <div className="form-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Enter your full name"
                />

              </div>

              <PhoneFields />

              <div className="form-group">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email address"
                />

              </div>
              <div className="form-group">

                <label>
                  {requestFormType === "contact"
                    ? "Reason for Contacting the Artist (Optional)"
                    : "Request Details"}
                </label>

                <textarea
                  name="requestDetails"
                  required={
                    requestFormType === "custom-art"
                  }
                  maxLength="2000"
                  placeholder={
                    requestFormType === "contact"
                      ? "Describe your reason for contacting the artist (optional)"
                      : "Describe the customized MicroArt you would like"
                  }
                  rows="5"
                />

              </div>

              <ConsentCheckbox />

              <button type="submit">
                {requestFormType === "contact"
                  ? "Send Message"
                  : "Submit Request"}
              </button>

            </form>

          </>

        ) : (

          <div className="request-success">

            <div className="success-icon">
              ✓
            </div>

            <h2>
              {requestFormType === "contact"
                ? "Message Sent!"
                : "Request Submitted!"}
            </h2>

            <p>
              {requestFormType === "contact"
                ? "Thank you for contacting MicroArts."
                : "Thank you for your interest in customized MicroArt."}
            </p>

            <p>
              {requestFormType === "contact"
                ? "The artist will contact you using the phone number or email you provided."
                : "The artist will contact you to discuss your customized art ideas and how they can be implemented."}
            </p>

            <button
              onClick={() => {
                setShowRequestForm(false)
                setRequestSubmitted(false)
                setCustomRequestArtwork(null)
                setRequestFormType("custom-art")
              }}
            >
              Close
            </button>

          </div>

        )}

      </div>

    </div>
  )
}

export default CustomRequestModal
