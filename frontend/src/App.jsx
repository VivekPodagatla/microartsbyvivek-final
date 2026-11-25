import { useState, useEffect, lazy, Suspense } from "react"
import "./App.css"
import { calculatePersonalizedPrice } from "./utils/pricing"
import { browserCountryCode } from "./utils/phone"
import {
  classifyNotification,
  titleByType,
} from "./utils/notifications"
import {
  getArtworks,
  createArtwork,
  patchArtwork,
  deleteArtworkById,
} from "./api/artworks"
import {
  getPersonalizedProducts,
  getArtistProducts,
  createProduct,
  patchProduct,
  deleteProductById,
} from "./api/personalizedProducts"
import { getProfile } from "./api/users"
import {
  loginArtist,
  verifyTwoFactorLogin,
  startTwoFactorSetup,
  enableTwoFactor,
  disableTwoFactor,
} from "./api/auth"
import {
  createOrder,
  getOrders,
  patchOrderStatus,
  deleteOrderById,
} from "./api/orders"
import {
  getCustomRequests,
  patchCustomRequestStatus,
  deleteCustomRequestById,
} from "./api/customRequests"
import PopupStyles from "./components/PopupStyles"
import Toast from "./components/Toast"
import ConfirmDialog from "./components/ConfirmDialog"
import Footer from "./components/Footer"
import Navbar from "./components/Navbar"
import OrderSuccess from "./views/OrderSuccess"
import Checkout from "./views/Checkout"
import Login from "./views/Login"
import Cart from "./views/Cart"
import ArtworkDetail from "./views/ArtworkDetail"
import GiftDetail from "./views/GiftDetail"
import PersonalizedGallery from "./views/PersonalizedGallery"
import Home from "./views/Home"
import CustomRequestModal from "./views/CustomRequestModal"
import DashboardHome from "./dashboard/DashboardHome"
import CustomRequestsSection from "./dashboard/CustomRequestsSection"
import OrdersSection from "./dashboard/OrdersSection"
import ProductsSection from "./dashboard/ProductsSection"
import FeaturedArtsSection from "./dashboard/FeaturedArtsSection"
import SecuritySection from "./dashboard/SecuritySection"

// The artist login is not linked anywhere on the site.
// It only opens from this URL.
const STUDIO_PATH_PATTERN = /^\/studio\/?$/

// The "Design your gift idea" designer.
const DESIGN_PATH_PATTERN = /^\/design\/?$/

// Detail, studio and designer URLs that are reset to "/" when
// leaving them for a page that has no URL of its own.
const RESETTABLE_PATH_PATTERN = /^\/((artworks|gifts)\/[^/]+|studio|design)\/?$/

// Loaded only when the designer is opened, so the rest of
// the site doesn't download it.
const Designer = lazy(() => import("./designer/Designer"))

// The dashboard's Design Requests section (also lazy).
const DesignRequestsAdmin = lazy(() => import("./designer/admin/DesignRequestsAdmin"))

// Jumps to the top of the page at once, now and again after the
// next page has rendered. App.css sets scroll-behavior: smooth, and
// on phones a smooth scroll is cut short when the page underneath
// changes, leaving the new page scrolled near its bottom.
// Smooth scrolling stays off until the new page has painted, because
// the browser may apply the scroll a moment after the call.
function jumpToTop() {
  const html = document.documentElement
  const jump = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" })

  html.style.scrollBehavior = "auto"
  jump()

  window.setTimeout(() => {
    jump()
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        jump()
        html.style.scrollBehavior = ""
      })
    })
  }, 0)
}

// The page the designer was opened from, read from
// /design?gift=<slug> or /design?artwork=<slug>.
function readDesignerSource() {
  const params = new URLSearchParams(window.location.search)
  if (params.get("gift")) return { type: "gift", slug: params.get("gift") }
  if (params.get("artwork")) return { type: "artwork", slug: params.get("artwork") }
  return null
}

function App() {
  const [artworks, setArtworks] = useState([])
  const [artworksLoading, setArtworksLoading] = useState(true)
  const [artworksError, setArtworksError] = useState(false)


  const loadArtworks = async () => {
    setArtworksLoading(true)
    setArtworksError(false)

    try {
      const response = await getArtworks()

      if (!response.ok) {
        throw new Error("Failed to load artworks")
      }

      const data = await response.json()

      if (!Array.isArray(data.artworks)) {
        throw new Error("Invalid artworks response")
      }

      setArtworks(data.artworks)
    } catch (error) {
      console.error("Artwork loading error:", error)
      setArtworksError(true)
    } finally {
      setArtworksLoading(false)
    }
  }

  useEffect(() => {
    loadArtworks()
  }, [])





  const loadPersonalizedProducts = async () => {
    setPersonalizedLoading(true)
    setPersonalizedError(false)

    try {
      const response = await getPersonalizedProducts()

      if (!response.ok) {
        throw new Error("Failed to load personalized products")
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error("Invalid personalized products response")
      }

      setPersonalizedProducts(data)
    } catch (error) {
      console.error("Personalized products loading error:", error)
      setPersonalizedError(true)
    } finally {
      setPersonalizedLoading(false)
    }
  }

  useEffect(() => {
    loadPersonalizedProducts()
  }, [])



  const [selectedArtwork, setSelectedArtwork] =
    useState(null)
    // ================= DIRECT ARTWORK URL SUPPORT =================

  useEffect(() => {
    const match = window.location.pathname.match(
      /^\/artworks\/([^/]+)\/?$/
    )

    if (!match || artworksLoading) return

    const slug = decodeURIComponent(match[1])

    const artwork = artworks.find(
      (item) => item.slug === slug
    )

    if (!artwork) return

    setSelectedArtwork(artwork)
    setShowPersonalized(false)
    setShowProduct(false)
  }, [artworks, artworksLoading])

  const [customRequestArtwork, setCustomRequestArtwork] =
    useState(null)

  const [requestFormType, setRequestFormType] =
    useState("custom-art")

  const [showRequestForm, setShowRequestForm] =
    useState(false)

  const [requestSubmitted, setRequestSubmitted] =
    useState(false)

  const [showPersonalized, setShowPersonalized] =
    useState(false)

  const [showProduct, setShowProduct] =
    useState(false)

  const [customText, setCustomText] =
    useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)


  // ================= AUTH PROFILE =================

  useEffect(() => {
    const token =
      localStorage.getItem("authToken")

    if (!token) {
      return
    }

    const loadUserProfile = async () => {
      try {
        const response = await getProfile(token)

        const data = await response.json()

        if (!response.ok) {
          localStorage.removeItem(
            "authToken"
          )

          setAuthToken(null)
          setIsLoggedIn(false)
          setUser(null)

          return
        }

        if (data.user?.role !== "artist") {
          localStorage.removeItem("authToken")
          setAuthToken(null)
          setIsLoggedIn(false)
          setUser(null)
          return
        }

        setUser(data.user)
        setIsLoggedIn(true)
        setAuthToken(token)

        // Already signed in on /studio: skip the login form.
        if (STUDIO_PATH_PATTERN.test(window.location.pathname)) {
          openArtistDashboard(token)
        }
      } catch (error) {
        console.error(
          "Profile loading error:",
          error
        )
      }
    }

    loadUserProfile()
  }, [])

  // ================= REQUESTS CART =================

  const [cart, setCart] = useState([])
  const [showCart, setShowCart] =
    useState(false)

  // ================= CHECKOUT =================

  const [showCheckout, setShowCheckout] =
    useState(false)

  const [checkoutName, setCheckoutName] =
    useState("")

  const [checkoutEmail, setCheckoutEmail] =
    useState("")

  const [checkoutPhone, setCheckoutPhone] =
    useState("")
  const [checkoutCountryCode, setCheckoutCountryCode] =
    useState(browserCountryCode)

  // WhatsApp is preferred; unticked means call or text instead.
  const [checkoutHasWhatsapp, setCheckoutHasWhatsapp] =
    useState(true)

  const [checkoutConsent, setCheckoutConsent] =
    useState(false)

  const [checkoutAddress, setCheckoutAddress] =
    useState("")
  // ================= ORDER SUBMITTING =================

  const [isSubmittingOrder, setIsSubmittingOrder] =
    useState(false)

    // ================= ORDER SUCCESS =================

  const [orderSubmitted, setOrderSubmitted] =
    useState(false)

  const [submittedOrder, setSubmittedOrder] =
    useState(null)

  // ================= ARTIST AUTHENTICATION UI =================

  const [showLogin, setShowLogin] =
    useState(() =>
      STUDIO_PATH_PATTERN.test(window.location.pathname)
    )

  // Set after a correct password when 2FA is on.
  // Holds the short-lived challenge token for the code step.
  const [twoFactorChallenge, setTwoFactorChallenge] =
    useState(null)

  const [loginCode, setLoginCode] =
    useState("")

  // QR code + secret while the artist sets up 2FA
  const [twoFactorSetup, setTwoFactorSetup] =
    useState(null)

  const [showArtistDashboard, setShowArtistDashboard] = useState(false)

  // ================= DESIGNER =================

  const [showDesigner, setShowDesigner] =
    useState(() =>
      DESIGN_PATH_PATTERN.test(window.location.pathname)
    )

  // The gift or artwork the customer was viewing when they opened
  // the designer (/design?gift=<slug> or /design?artwork=<slug>).
  // The design is sent with a request for that gift, or as a
  // custom request inspired by that artwork.
  const [designerSource, setDesignerSource] =
    useState(() => readDesignerSource())
  const [customRequests, setCustomRequests] = useState([])
  // ================= CUSTOMER ORDERS =================

  const [orders, setOrders] = useState([])

  const [personalizedProducts, setPersonalizedProducts] = useState([])

  const [personalizedLoading, setPersonalizedLoading] = useState(true)
  const [personalizedError, setPersonalizedError] = useState(false)

  const [selectedPersonalizedProduct,setSelectedPersonalizedProduct,] = useState(null)

  // "all" or one of the gift categories
  const [giftCategoryFilter, setGiftCategoryFilter] = useState("all")
  const [giftSearch, setGiftSearch] = useState("")

  // Open a gift when its SEO URL is loaded directly or refreshed.
  useEffect(() => {
    const match = window.location.pathname.match(/^\/gifts\/([^/]+)\/?$/)
    if (!match || personalizedLoading) return
    const product = personalizedProducts.find(
      (item) => item.slug === decodeURIComponent(match[1])
    )
    if (!product) return
    setSelectedPersonalizedProduct(product)
    setShowProduct(true)
    setSelectedArtwork(null)
    setShowPersonalized(false)
  }, [personalizedProducts, personalizedLoading])

  // ================= BROWSER BACK BUTTON =================

  useEffect(() => {
    if (!window.history.state?.microartsView) {
      const isDirectDetail = /^\/(artworks|gifts)\/[^/]+\/?$/.test(
        window.location.pathname
      )
      window.history.replaceState(
        {
          microartsView: isDirectDetail
            ? (window.location.pathname.startsWith("/artworks/") ? "artwork" : "product")
            : "home",
          directEntry: isDirectDetail,
        },
        "",
        window.location.href
      )
    }

    const handleBrowserBack = (event) => {
      const view = event.state?.microartsView || "home"
      const artworkMatch = window.location.pathname.match(/^\/artworks\/([^/]+)\/?$/)
      const giftMatch = window.location.pathname.match(/^\/gifts\/([^/]+)\/?$/)

      // Close detail pages
      setSelectedArtwork(null)
      setShowProduct(false)
      setSelectedPersonalizedProduct(null)

      // Close other screens
      setShowCart(false)
      setShowLogin(false)
      setShowArtistDashboard(false)
      setShowCheckout(false)
      setShowRequestForm(false)

      setCustomText("")

      const isDesignPath = DESIGN_PATH_PATTERN.test(window.location.pathname)
      setShowDesigner(isDesignPath)

      if (isDesignPath) {
        setDesignerSource(readDesignerSource())
        setShowPersonalized(false)
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }

      // Restore detail views when navigating Forward or Back to their URLs.
      if (artworkMatch) {
        const artwork = artworks.find((item) =>
          item.slug === decodeURIComponent(artworkMatch[1])
        )
        if (artwork) {
          setSelectedArtwork(artwork)
          setShowPersonalized(false)
          window.scrollTo({ top: 0, behavior: "smooth" })
          return
        }
      }

      if (giftMatch) {
        const product = personalizedProducts.find((item) =>
          item.slug === decodeURIComponent(giftMatch[1])
        )
        if (product) {
          setSelectedPersonalizedProduct(product)
          setShowProduct(true)
          setShowPersonalized(false)
          window.scrollTo({ top: 0, behavior: "smooth" })
          return
        }
      }

      if (view === "personalized") {
        setShowPersonalized(true)

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })

        return
      }

      // Default = Home
      setShowPersonalized(false)

      setTimeout(() => {
        if (
          event.state?.returnTo === "gallery"
        ) {
          document
            .getElementById("gallery")
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
        } else {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
      }, 50)
    }

    window.addEventListener(
      "popstate",
      handleBrowserBack
    )

    return () => {
      window.removeEventListener(
        "popstate",
        handleBrowserBack
      )
    }
  }, [artworks, personalizedProducts])
  const [showAddProductForm, setShowAddProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const [showAddArtworkForm, setShowAddArtworkForm] = useState(false)
  const [editingArtwork, setEditingArtwork] = useState(null)

  const [artistDashboardSection, setArtistDashboardSection] = useState("home")

  const [isLoggedIn, setIsLoggedIn] =
    useState(false)

  const [user, setUser] = useState(null)

  const [authToken, setAuthToken] =
    useState(
      localStorage.getItem("authToken")
    )

  // ================= LOGIN FIELDS =================

  const [loginEmail, setLoginEmail] =
    useState("")

  const [loginPassword, setLoginPassword] =
    useState("")

  // ================= MICROARTS NOTIFICATIONS =================

  const [notification, setNotification] =
    useState(null)

  const [confirmDialog, setConfirmDialog] =
    useState(null)

  useEffect(() => {
    if (!notification) {
      return
    }

    const timer = window.setTimeout(() => {
      setNotification(null)
    }, 3500)

    return () => {
      window.clearTimeout(timer)
    }
  }, [notification])

  const showNotification = (
    message,
    forcedType = null,
    forcedTitle = null
  ) => {
    const notificationMessage =
      String(
        message ||
          "Something went wrong."
      )

    let type = forcedType

    if (!type) {
      type = classifyNotification(
        notificationMessage
      )
    }

    setNotification({
      message:
        notificationMessage,
      type,
      title:
        forcedTitle ||
        titleByType[type] ||
        "MicroArts",
    })
  }

  const showConfirm = ({
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    danger = false,
  }) => {
    return new Promise(
      (resolve) => {
        setConfirmDialog({
          title,
          message,
          confirmText,
          cancelText,
          danger,
          resolve,
        })
      }
    )
  }

  const closeConfirmDialog = (
    result
  ) => {
    if (!confirmDialog) {
      return
    }

    const resolve =
      confirmDialog.resolve

    setConfirmDialog(null)

    resolve(result)
  }

 // ================= PRICING =================

  const letterCount =
    customText.replace(/\s/g, "").length


  // ================= NAVIGATION =================

  const goHome = () => {
    if (RESETTABLE_PATH_PATTERN.test(window.location.pathname)) {
      window.history.replaceState({ microartsView: "home" }, "", "/")
    }
    setShowCart(false)
    setShowProduct(false)
    setShowPersonalized(false)
    setShowLogin(false)
    setShowArtistDashboard(false)
    setShowDesigner(false)

    // Close checkout
    setShowCheckout(false)

    // Clear order success screen
    setOrderSubmitted(false)
    setSubmittedOrder(null)

    // Clear selected artwork/product
    setSelectedArtwork(null)
    setSelectedPersonalizedProduct(null)

    // Clear personalized text
    setCustomText("")

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const openPersonalized = async () => {
    if (RESETTABLE_PATH_PATTERN.test(window.location.pathname)) {
      window.history.replaceState({ microartsView: "home" }, "", "/")
    }
    if (
      window.history.state?.microartsView !==
      "personalized"
    ) {
      window.history.pushState(
        {
          microartsView: "personalized",
        },
        "",
        window.location.href
      )
    }
    setShowCart(false)
    setShowProduct(false)
    setShowLogin(false)
    setShowArtistDashboard(false)
    setShowDesigner(false)
    setShowCheckout(false)
    setShowPersonalized(true)

    setOrderSubmitted(false)
    setSubmittedOrder(null)

    setSelectedArtwork(null)

    // Instant, so phones land at the top of the gifts page.
    jumpToTop()
  }
  const openCart = () => {
    if (RESETTABLE_PATH_PATTERN.test(window.location.pathname)) {
      window.history.replaceState({ microartsView: "home" }, "", "/")
    }
    setShowCart(true)
    setShowProduct(false)
    setShowPersonalized(false)
    setShowLogin(false)
    setShowArtistDashboard(false)
    setShowDesigner(false)
    setShowCheckout(false)

    setOrderSubmitted(false)
    setSubmittedOrder(null)

    setSelectedArtwork(null)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Opens the "Design your gift idea" designer at /design.
  // source: { type: "gift" | "artwork", slug } when opened from a
  // gift or artwork page; it goes in the URL (?gift= / ?artwork=).
  // Buttons that pass a click event open it with no source.
  // The page it was opened from stays in the history (marked with
  // fromSite), so Back returns there.
  const openDesigner = (source = null) => {
    const designerFrom =
      (source?.type === "gift" || source?.type === "artwork") &&
      typeof source.slug === "string"
        ? { type: source.type, slug: source.slug }
        : null
    const designUrl = designerFrom
      ? `/design?${designerFrom.type}=${encodeURIComponent(designerFrom.slug)}`
      : "/design"

    if (STUDIO_PATH_PATTERN.test(window.location.pathname)) {
      window.history.replaceState({ microartsView: "home" }, "", "/")
    }
    if (DESIGN_PATH_PATTERN.test(window.location.pathname)) {
      window.history.replaceState(
        { ...window.history.state, microartsView: "design" },
        "",
        designUrl
      )
    } else {
      window.history.pushState(
        { microartsView: "design", fromSite: true },
        "",
        designUrl
      )
    }
    setDesignerSource(designerFrom)
    setShowDesigner(true)
    setShowCart(false)
    setShowProduct(false)
    setShowPersonalized(false)
    setShowLogin(false)
    setShowArtistDashboard(false)
    setShowCheckout(false)
    setShowRequestForm(false)
    setRequestSubmitted(false)

    setOrderSubmitted(false)
    setSubmittedOrder(null)

    setSelectedArtwork(null)
    setSelectedPersonalizedProduct(null)

    jumpToTop()
  }


  // The designer's back button. Opened from within the site, it
  // goes back to that page (gift, artwork, gifts list, home), like
  // the browser's Back. Opened from a link, it goes to the gift or
  // artwork in the URL, or home.
  const leaveDesigner = () => {
    if (window.history.state?.fromSite) {
      window.history.back()
      return
    }

    if (designerGift) {
      window.history.replaceState(
        { microartsView: "product", directEntry: true },
        "",
        `/gifts/${designerGift.slug}`
      )
      setShowDesigner(false)
      setCustomText("")
      setSelectedPersonalizedProduct(designerGift)
      setShowProduct(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    if (designerArtwork) {
      window.history.replaceState(
        { microartsView: "artwork", directEntry: true },
        "",
        `/artworks/${designerArtwork.slug}`
      )
      setShowDesigner(false)
      setSelectedArtwork(designerArtwork)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    goHome()
  }

  const designerBackLabel =
    designerSource?.type === "gift"
      ? "← Back to Gift"
      : designerSource?.type === "artwork"
        ? "← Back to Artwork"
        : window.history.state?.fromSite
          ? "← Back"
          : "← Back to Home"

  // A function declaration (hoisted) so the profile loader
  // above can call it when /studio is opened while signed in.
  async function openArtistDashboard(tokenOverride = authToken) {
    // The dashboard lives at /studio, so a refresh brings
    // the artist back here (or to the login if signed out).
    if (!STUDIO_PATH_PATTERN.test(window.location.pathname)) {
      window.history.replaceState({ microartsView: "home" }, "", "/studio")
    }
    const dashboardToken = tokenOverride

    setShowArtistDashboard(true)
    setArtistDashboardSection("home")
    setShowDesigner(false)

    setShowCart(false)
    setShowProduct(false)
    setShowPersonalized(false)
    setShowLogin(false)
    setSelectedArtwork(null)
    setShowRequestForm(false)
    setRequestSubmitted(false)

    try {
      // Load customized art requests
      const requestsResponse = await getCustomRequests(
        dashboardToken
      )

      const requestsData =
        await requestsResponse.json()

      if (!requestsResponse.ok) {
        showNotification(
          requestsData.message ||
            "Failed to load custom requests"
        )
        return
      }

      // Load personalized products
      const productsResponse = await getArtistProducts(
        dashboardToken
      )

      const productsData =
        await productsResponse.json()

      if (!productsResponse.ok) {
        showNotification(
          productsData.message ||
            "Failed to load personalized products"
        )
        return
      }
      const ordersResponse = await getOrders(
        dashboardToken
      )

      const ordersData = await ordersResponse.json()

      if (!ordersResponse.ok) {
        showNotification(
          ordersData.message ||
            "Failed to load customer orders"
        )
        return
      }

      setCustomRequests(requestsData)
      setPersonalizedProducts(productsData)
      setOrders(ordersData)
    } catch (error) {
      console.error(
        "Artist dashboard error:",
        error
      )

      showNotification(
        "Unable to load Artist Dashboard"
      )
    }
  }

  // Artist-only deletion; uses the existing MicroArts confirmation modal.
  const deleteCustomRequest = async (requestId) => {
    const confirmed = await showConfirm({
      title: "Delete Custom Request?",
      message: "Are you sure you want to permanently delete this customer request? This action cannot be undone.",
      confirmText: "Delete Request",
      cancelText: "Cancel",
      danger: true,
    })

    if (!confirmed) return

    try {
      const response = await deleteCustomRequestById(
        authToken,
        requestId
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete request.")
      }
      setCustomRequests((currentRequests) =>
        currentRequests.filter((request) => request._id !== requestId)
      )
      showNotification("Request deleted successfully.")
    } catch (error) {
      console.error("Delete custom request error:", error)
      showNotification(error.message || "Unable to delete request.")
    }
  }

  // Requires a matching artist-protected DELETE /api/orders/:id route.
  const deletePersonalizedOrder = async (orderId) => {
    const confirmed = await showConfirm({
      title: "Delete Personalized Gift Request?",
      message: "Are you sure you want to permanently delete this personalized gift request? This action cannot be undone.",
      confirmText: "Delete Request",
      cancelText: "Cancel",
      danger: true,
    })

    if (!confirmed) return

    try {
      const response = await deleteOrderById(authToken, orderId)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete personalized gift request.")
      }
      setOrders((currentOrders) =>
        currentOrders.filter((order) => order._id !== orderId)
      )
      showNotification("Personalized gift request deleted successfully.")
    } catch (error) {
      console.error("Delete personalized gift request error:", error)
      showNotification(error.message || "Unable to delete personalized gift request.")
    }
  }

  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      const response = await patchCustomRequestStatus(
        authToken,
        requestId,
        newStatus
      )

      const data = await response.json()

      if (!response.ok) {
        showNotification(data.message || "Failed to update status")
        return
      }

      setCustomRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === requestId
            ? data.request
            : request
        )
      )
    } catch (error) {
      console.error("Status update error:", error)
      showNotification("Unable to update request status")
    }
  }
  // ================= UPDATE ORDER STATUS =================

  const updateOrderStatus = async (
    orderId,
    newStatus
  ) => {
    try {
      const response = await patchOrderStatus(
        authToken,
        orderId,
        newStatus
      )

      const data = await response.json()

      if (!response.ok) {
        showNotification(
          data.message ||
            "Failed to update order status."
        )
        return
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? data.order
            : order
        )
      )

    } catch (error) {
      console.error(
        "Order status update error:",
        error
      )

      showNotification(
        "Unable to update order status."
      )
    }
  }

  const handleAddProduct = async (event) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await createProduct(
        authToken,
        formData
      )

      const data = await response.json()

      if (!response.ok) {
        showNotification(
          data.message ||
            "Failed to add personalized product"
        )
        return
      }

      setPersonalizedProducts(
        (currentProducts) => [
          data.product,
          ...currentProducts,
        ]
      )

      setShowAddProductForm(false)

      form.reset()

      showNotification(
        "Personalized MicroArt added successfully!"
      )
    } catch (error) {
      console.error(
        "Add personalized product error:",
        error
      )

      showNotification(
        "Unable to add personalized product"
      )
    }
  }
  // Artist-only stock availability, independent of Active / Inactive.
  const toggleProductStock = async (product) => {
    try {
      const formData = new FormData()
      formData.append("inStock", String(product.inStock !== false ? false : true))
      const response = await patchProduct(authToken, product._id, formData)
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to update stock")
      setPersonalizedProducts((current) =>
        current.map((item) => item._id === product._id ? data.product : item)
      )
      setSelectedPersonalizedProduct((current) =>
        current?._id === product._id ? data.product : current
      )
      showNotification(data.product.inStock === false
        ? "Product marked Out of Stock."
        : "Product marked In Stock.")
    } catch (error) {
      showNotification(error.message || "Unable to update stock status")
    }
  }

  const toggleProductActive = async (product) => {
    try {
      const formData = new FormData()

      formData.append(
        "active",
        String(!product.active)
      )

      const response = await patchProduct(
        authToken,
        product._id,
        formData
      )

      const data = await response.json()

      if (!response.ok) {
        showNotification(
          data.message ||
            "Failed to update product"
        )
        return
      }

      setPersonalizedProducts((currentProducts) =>
        currentProducts.map((currentProduct) =>
          currentProduct._id === product._id
            ? data.product
            : currentProduct
        )
      )
    } catch (error) {
      console.error(
        "Update product status error:",
        error
      )

      showNotification("Unable to update product")
    }
  }

  const deleteProduct = async (product) => {
    const confirmed =
      await showConfirm({
        title:
          "Delete Personalized Art?",
        message:
          `Are you sure you want to permanently delete "${product.title}"? This action cannot be undone.`,
        confirmText:
          "Delete",
        cancelText:
          "Cancel",
        danger: true,
      })

    if (!confirmed) {
      return
    }

    try {
      const response = await deleteProductById(
        authToken,
        product._id
      )

      const data = await response.json()

      if (!response.ok) {
        showNotification(
          data.message ||
            "Failed to delete product"
        )
        return
      }

      setPersonalizedProducts((currentProducts) =>
        currentProducts.filter(
          (currentProduct) =>
            currentProduct._id !== product._id
        )
      )

      showNotification("Product deleted successfully!")
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      )

      showNotification("Unable to delete product")
    }
  }

  const handleEditProduct = async (event) => {
    event.preventDefault()

    if (!editingProduct) {
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await patchProduct(
        authToken,
        editingProduct._id,
        formData
      )

      const data = await response.json()

      if (!response.ok) {
        showNotification(
          data.message ||
            "Failed to update personalized product"
        )
        return
      }

      setPersonalizedProducts((currentProducts) =>
        currentProducts.map((product) =>
          product._id === editingProduct._id
            ? data.product
            : product
        )
      )

      setEditingProduct(null)

      showNotification("Product updated successfully!")
    } catch (error) {
      console.error(
        "Edit personalized product error:",
        error
      )

      showNotification("Unable to update personalized product")
    }
  }
  // ================= FEATURED ARTWORK MANAGEMENT =================

  const handleAddArtwork = async (event) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await createArtwork(
        authToken,
        formData
      )

      const data = await response.json()

      if (!response.ok) {
        showNotification(
          data.message ||
            "Failed to add artwork"
        )
        return
      }

      const newArtwork = data.artwork || data

      setArtworks((currentArtworks) => [
        ...currentArtworks,
        newArtwork,
      ])

      setShowAddArtworkForm(false)
      form.reset()

      showNotification("Artwork added successfully!")
    } catch (error) {
      console.error(
        "Add artwork error:",
        error
      )

      showNotification("Unable to add artwork")
    }
  }


  const handleEditArtwork = async (event) => {
    event.preventDefault()

    if (!editingArtwork) {
      return
    }

    const formData = new FormData(
      event.currentTarget
    )

    try {
      const response = await patchArtwork(
        authToken,
        editingArtwork._id,
        formData
      )

      const data = await response.json()

      if (!response.ok) {
        showNotification(
          data.message ||
            "Failed to update artwork"
        )
        return
      }

      const updatedArtwork =
        data.artwork || data

      setArtworks((currentArtworks) =>
        currentArtworks.map((artwork) =>
          artwork._id === updatedArtwork._id
            ? updatedArtwork
            : artwork
        )
      )

      setEditingArtwork(null)

      showNotification("Artwork updated successfully!")
    } catch (error) {
      console.error(
        "Edit artwork error:",
        error
      )

      showNotification("Unable to update artwork")
    }
  }


  const toggleArtworkFeatured = async (artwork) => {
    const formData = new FormData()

    formData.append(
      "featured",
      String(!artwork.featured)
    )

    if (!artwork.featured) {
      formData.append(
        "featuredOrder",
        String(artwork.featuredOrder || 1)
      )
    }

    try {
      const response = await patchArtwork(
        authToken,
        artwork._id,
        formData
      )

      const data = await response.json()

      if (!response.ok) {
        showNotification(
          data.message ||
            "Failed to update featured artwork"
        )
        return
      }

      const updatedArtwork =
        data.artwork || data

      setArtworks((currentArtworks) =>
        currentArtworks.map((currentArtwork) =>
          currentArtwork._id === updatedArtwork._id
            ? updatedArtwork
            : currentArtwork
        )
      )
    } catch (error) {
      console.error(
        "Featured artwork update error:",
        error
      )

      showNotification("Unable to update featured artwork")
    }
  }


  const deleteArtwork = async (artwork) => {
    const confirmed =
      await showConfirm({
        title:
          "Delete Artwork?",
        message:
          `Are you sure you want to permanently delete "${artwork.title}"? This action cannot be undone.`,
        confirmText:
          "Delete",
        cancelText:
          "Cancel",
        danger: true,
      })

    if (!confirmed) {
      return
    }

    try {
      const response = await deleteArtworkById(
        authToken,
        artwork._id
      )

      const data = await response.json()

      if (!response.ok) {
        showNotification(
          data.message ||
            "Failed to delete artwork"
        )
        return
      }

      setArtworks((currentArtworks) =>
        currentArtworks.filter(
          (currentArtwork) =>
            currentArtwork._id !== artwork._id
        )
      )

      showNotification("Artwork deleted successfully!")
    } catch (error) {
      console.error(
        "Delete artwork error:",
        error
      )

      showNotification("Unable to delete artwork")
    }
  }


  const displayedArtworks = [...artworks].sort(
    (firstArtwork, secondArtwork) => {
      const firstFeatured = Boolean(
        firstArtwork.featured
      )
      const secondFeatured = Boolean(
        secondArtwork.featured
      )

      if (firstFeatured !== secondFeatured) {
        return firstFeatured ? -1 : 1
      }

      if (firstFeatured && secondFeatured) {
        return (
          Number(firstArtwork.featuredOrder || 9999) -
          Number(secondArtwork.featuredOrder || 9999)
        )
      }

      return 0
    }
  )

  const displayedPersonalizedProducts =
    [...personalizedProducts].sort(
      (firstProduct, secondProduct) => {

        const firstOrder =
          Number(
            firstProduct.displayOrder
          ) || 9999

        const secondOrder =
          Number(
            secondProduct.displayOrder
          ) || 9999

        return (
          firstOrder -
          secondOrder
        )
      }
    )

  // ================= GIFT CATEGORY FILTER =================

  const giftCategories = [
    ...new Set(
      personalizedProducts
        .map((product) => product.category?.trim())
        .filter(Boolean)
    ),
  ].sort((first, second) => first.localeCompare(second))

  // Falls back to "all" if the chosen category no longer exists.
  const activeGiftCategory =
    giftCategories.includes(giftCategoryFilter)
      ? giftCategoryFilter
      : "all"

  const categoryPersonalizedProducts =
    activeGiftCategory === "all"
      ? displayedPersonalizedProducts
      : displayedPersonalizedProducts.filter(
          (product) => product.category?.trim() === activeGiftCategory
        )

  // ================= GIFT SEARCH =================
  // Every word must appear in the title, category or description.

  const giftSearchWords = giftSearch
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  // ================= DESIGNER SOURCE =================

  const designerGift = designerSource?.type === "gift"
    ? personalizedProducts.find((product) => product.slug === designerSource.slug) || null
    : null

  const designerArtwork = designerSource?.type === "artwork"
    ? artworks.find((artwork) => artwork.slug === designerSource.slug) || null
    : null

  const filteredPersonalizedProducts =
    giftSearchWords.length === 0
      ? categoryPersonalizedProducts
      : categoryPersonalizedProducts.filter((product) => {
          const searchableText = [
            product.title,
            product.category,
            product.description,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()

          return giftSearchWords.every((word) =>
            searchableText.includes(word)
          )
        })


  // ================= ARTWORK DETAIL =================

  const openArtwork = (artwork) => {
    window.history.replaceState(
      {
        ...window.history.state,
        microartsView: "home",
        returnTo: "gallery",
      },
      "",
      window.location.href
    )

    window.history.pushState(
      {
        microartsView: "artwork",
      },
      "",
      `/artworks/${artwork.slug}`
    )

    setSelectedArtwork(artwork)

    setShowCart(false)
    setShowProduct(false)
    setShowPersonalized(false)
    setShowLogin(false)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const backToGallery = () => {
    if (window.history.state?.directEntry) {
      goHome()
      window.setTimeout(() => {
        document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" })
      }, 50)
      return
    }
    if (
      window.history.state?.microartsView ===
      "artwork"
    ) {
      window.history.back()
      return
    }

    setSelectedArtwork(null)

    setTimeout(() => {
      document
        .getElementById("gallery")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
    }, 50)
  }

  // ================= ARTIST LOGIN =================

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const response = await loginArtist(
        loginEmail,
        loginPassword
      )

      const data = await response.json()

      if (!response.ok) {
        showNotification(
          data.message ||
            "Invalid email or password."
        )
        return
      }

      // Password was correct; ask for the authenticator code next.
      if (data.twoFactorRequired) {
        setTwoFactorChallenge(data.challengeToken)
        setLoginPassword("")
        setLoginCode("")
        return
      }

      await completeArtistLogin(data)

    } catch (error) {
      console.error(
        "Artist login error:",
        error
      )

      showNotification(
        "Unable to connect to the server. Make sure the backend is running."
      )
    }
  }

  // ================= ARTIST LOGIN - 2FA CODE =================

  const handleVerifyTwoFactor = async (event) => {
    event.preventDefault()

    try {
      const response = await verifyTwoFactorLogin(
        twoFactorChallenge,
        loginCode
      )

      const data = await response.json()

      if (!response.ok) {
        // An expired challenge needs the password again.
        if (data.message?.includes("expired")) {
          setTwoFactorChallenge(null)
        }

        setLoginCode("")

        showNotification(
          data.message ||
            "Invalid authentication code."
        )
        return
      }

      await completeArtistLogin(data)

    } catch (error) {
      console.error(
        "Two-factor login error:",
        error
      )

      showNotification(
        "Unable to connect to the server. Make sure the backend is running."
      )
    }
  }

  const cancelTwoFactorLogin = () => {
    setTwoFactorChallenge(null)
    setLoginCode("")
  }

  // Shared by password-only and 2FA logins
  const completeArtistLogin = async (data) => {
    if (data.user?.role !== "artist") {
      localStorage.removeItem("authToken")
      setAuthToken(null)
      setUser(null)
      setIsLoggedIn(false)
      setLoginPassword("")

      showNotification(
        "This login is for the artist only."
      )
      return
    }

    localStorage.setItem(
      "authToken",
      data.token
    )

    setAuthToken(data.token)
    setUser(data.user)
    setIsLoggedIn(true)

    setLoginEmail("")
    setLoginPassword("")
    setLoginCode("")
    setTwoFactorChallenge(null)
    setShowLogin(false)

    await openArtistDashboard(data.token)

    if (!data.user.twoFactorEnabled) {
      showNotification(
        "Protect your account: turn on two-factor authentication in Account Security.",
        "warning"
      )
    }
  }

  // ================= TWO-FACTOR SETUP =================

  const handleStartTwoFactorSetup = async () => {
    try {
      const response = await startTwoFactorSetup(authToken)
      const data = await response.json()

      if (!response.ok) {
        showNotification(
          data.message ||
            "Unable to start two-factor setup."
        )
        return
      }

      setTwoFactorSetup({
        qrCode: data.qrCode,
        secret: data.secret,
      })
    } catch (error) {
      console.error("Two-factor setup error:", error)
      showNotification("Unable to start two-factor setup.")
    }
  }

  const handleEnableTwoFactor = async (event) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    try {
      const response = await enableTwoFactor(
        authToken,
        String(formData.get("code") || "")
      )
      const data = await response.json()

      if (!response.ok) {
        showNotification(
          data.message ||
            "Unable to turn on two-factor authentication."
        )
        return
      }

      setUser(data.user)
      setTwoFactorSetup(null)
      showNotification(data.message, "success")
    } catch (error) {
      console.error("Two-factor enable error:", error)
      showNotification("Unable to turn on two-factor authentication.")
    }
  }

  const handleDisableTwoFactor = async (event) => {
    event.preventDefault()

    // Read before awaiting: React clears currentTarget afterwards.
    const formData = new FormData(event.currentTarget)

    const confirmed = await showConfirm({
      title: "Turn Off Two-Factor Authentication?",
      message:
        "Your account will be protected by your password only.",
      confirmText: "Turn Off",
      cancelText: "Cancel",
      danger: true,
    })

    if (!confirmed) {
      return
    }

    try {
      const response = await disableTwoFactor(
        authToken,
        String(formData.get("password") || ""),
        String(formData.get("code") || "")
      )
      const data = await response.json()

      if (!response.ok) {
        showNotification(
          data.message ||
            "Unable to turn off two-factor authentication."
        )
        return
      }

      setUser(data.user)
      showNotification(data.message)
    } catch (error) {
      console.error("Two-factor disable error:", error)
      showNotification("Unable to turn off two-factor authentication.")
    }
  }

  // ================= LOGOUT =================

  const handleLogout = () => {
    localStorage.removeItem(
      "authToken"
    )

    setAuthToken(null)
    setIsLoggedIn(false)
    setUser(null)

    // Close Artist Dashboard and clear artist-only data
    setShowArtistDashboard(false)
    setCustomRequests([])
    setOrders([])
    setTwoFactorSetup(null)

    // Return to the homepage
    goHome()

    showNotification(
      "You have been logged out."
    )
  }


  // ================= ADD TO REQUESTS =================

  const addToCart = () => {
    if (!selectedPersonalizedProduct) {
      showNotification("Please select a product.")
      return
    }

    if (selectedPersonalizedProduct.inStock === false) {
      showNotification("This gift is currently out of stock.", "warning")
      return
    }

    if (letterCount === 0) {
      showNotification(
        "Please enter a name or message before adding to requests."
      )
      return
    }

    const itemPrice =
      calculatePersonalizedPrice(
        selectedPersonalizedProduct,
        customText
      )

    const newItem = {
      id:
        `${selectedPersonalizedProduct._id}-${Date.now()}`,

      productId:
        selectedPersonalizedProduct._id,

      product:
        selectedPersonalizedProduct.title,

      text:
        customText.trim(),

      price:
        itemPrice,

      quantity:
        1,

      image:
        selectedPersonalizedProduct.image,
    }

    setCart((previousCart) => [
      ...previousCart,
      newItem,
    ])

    if (/^\/gifts\/[^/]+\/?$/.test(window.location.pathname)) {
      window.history.replaceState({ microartsView: "home" }, "", "/")
    }
    setCustomText("")
    setSelectedPersonalizedProduct(null)

    setShowProduct(false)
    setShowPersonalized(false)
    setShowCart(true)
  }


  // ================= INCREASE QUANTITY =================

  const increaseQuantity = (id) => {
    setCart((previousCart) =>
      previousCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    )
  }


  // ================= DECREASE QUANTITY =================

  const decreaseQuantity = (id) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }


  // ================= REMOVE FROM CART =================

  const removeFromCart = (id) => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) => item.id !== id
      )
    )
  }


  // ================= REQUEST ITEM COUNT =================

  const cartItemCount = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  )


  // ================= REQUEST TOTAL =================

  const cartTotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  )
  // ================= SUBMIT ORDER REQUEST =================

  const handleSubmitOrder = async (event) => {
    event.preventDefault()

    // Prevent duplicate submissions
    if (isSubmittingOrder) {
      return
    }

    if (cart.length === 0) {
      showNotification("Your requests cart is empty.")
      return
    }

    // Recheck availability before checkout; the backend enforces it too.
    try {
      const response = await getPersonalizedProducts()
      if (!response.ok) throw new Error("Unable to verify gift availability.")
      const products = await response.json()
      const unavailable = cart.find((item) => {
        const product = products.find((p) => p._id === item.productId)
        return !product || product.inStock === false
      })
      if (unavailable) {
        showNotification(`"${unavailable.product}" is no longer available. Please remove it from your requests.`, "warning")
        return
      }
    } catch (error) {
      showNotification(error.message || "Unable to verify gift availability.", "error")
      return
    }

    setIsSubmittingOrder(true)

    try {
      const response = await createOrder({
        fullName: checkoutName,
        email: checkoutEmail,
        countryCode: checkoutCountryCode,
        phone: checkoutPhone,
        hasWhatsapp: checkoutHasWhatsapp,
        consent: checkoutConsent,
        address: checkoutAddress,

        items: cart.map((item) => ({
          productId: item.productId,
          text: item.text,
          quantity: item.quantity,
        })),
      })

      const data = await response.json()

      if (!response.ok) {
        showNotification(
          data.message ||
            "Failed to submit order request."
        )

        setIsSubmittingOrder(false)
        return
      }

      // Save submitted order
      setSubmittedOrder(data.order)

      // Show success screen
      setOrderSubmitted(true)

      // Clear cart
      setCart([])

      // Clear checkout form
      setCheckoutName("")
      setCheckoutEmail("")
      setCheckoutPhone("")
      setCheckoutCountryCode(browserCountryCode())
      setCheckoutHasWhatsapp(true)
      setCheckoutConsent(false)
      setCheckoutAddress("")

      // Close checkout
      setShowCheckout(false)

      // Submission finished
      setIsSubmittingOrder(false)

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })

    } catch (error) {
      console.error(
        "Order submission error:",
        error
      )

      setIsSubmittingOrder(false)

      showNotification(
        "Unable to submit your order request. Please try again."
      )
    }
  }


  // ================= PAGE =================

  return (
    <div className="app">

      {/* ================= MICROARTS POPUP STYLES ================= */}

      <PopupStyles />


      {/* ================= MICROARTS NOTIFICATION ================= */}

      <Toast
        notification={notification}
        setNotification={setNotification}
      />


      {/* ================= MICROARTS CONFIRMATION ================= */}

      <ConfirmDialog
        confirmDialog={confirmDialog}
        closeConfirmDialog={closeConfirmDialog}
      />


      {/* ================= NAVBAR ================= */}

      <Navbar
        setMobileMenuOpen={setMobileMenuOpen}
        goHome={goHome}
        mobileMenuOpen={mobileMenuOpen}
        isLoggedIn={isLoggedIn}
        user={user}
        openArtistDashboard={openArtistDashboard}
        handleLogout={handleLogout}
        openCart={openCart}
        cartItemCount={cartItemCount}
      />


      {/* ================= LOGIN ================= */}

      {orderSubmitted && submittedOrder ? (

        /* ================= ORDER SUCCESS ================= */

        <OrderSuccess
          submittedOrder={submittedOrder}
          setOrderSubmitted={setOrderSubmitted}
          setSubmittedOrder={setSubmittedOrder}
          goHome={goHome}
        />

      ) : showCheckout ? (

        /* ================= CHECKOUT ================= */
        <Checkout
          setShowCheckout={setShowCheckout}
          setShowCart={setShowCart}
          handleSubmitOrder={handleSubmitOrder}
          checkoutName={checkoutName}
          setCheckoutName={setCheckoutName}
          checkoutEmail={checkoutEmail}
          setCheckoutEmail={setCheckoutEmail}
          checkoutCountryCode={checkoutCountryCode}
          setCheckoutCountryCode={setCheckoutCountryCode}
          checkoutPhone={checkoutPhone}
          setCheckoutPhone={setCheckoutPhone}
          checkoutHasWhatsapp={checkoutHasWhatsapp}
          setCheckoutHasWhatsapp={setCheckoutHasWhatsapp}
          checkoutConsent={checkoutConsent}
          setCheckoutConsent={setCheckoutConsent}
          checkoutAddress={checkoutAddress}
          setCheckoutAddress={setCheckoutAddress}
          isSubmittingOrder={isSubmittingOrder}
          cart={cart}
          cartItemCount={cartItemCount}
          cartTotal={cartTotal}
        />

      ) : showLogin ? (

        /* ================= ARTIST LOGIN ================= */

        <Login
          goHome={goHome}
          handleLogin={handleLogin}
          loginEmail={loginEmail}
          setLoginEmail={setLoginEmail}
          loginPassword={loginPassword}
          setLoginPassword={setLoginPassword}
          twoFactorChallenge={twoFactorChallenge}
          handleVerifyTwoFactor={handleVerifyTwoFactor}
          loginCode={loginCode}
          setLoginCode={setLoginCode}
          cancelTwoFactorLogin={cancelTwoFactorLogin}
        />

      ) : showCart ? (

        /* ================= REQUESTS CART ================= */

        <Cart
          openPersonalized={openPersonalized}
          cartItemCount={cartItemCount}
          cart={cart}
          decreaseQuantity={decreaseQuantity}
          increaseQuantity={increaseQuantity}
          removeFromCart={removeFromCart}
          cartTotal={cartTotal}
          setShowCheckout={setShowCheckout}
          setShowCart={setShowCart}
        />

      ) : showArtistDashboard ? (

        /* ================= ARTIST DASHBOARD ================= */

        <section className="artist-dashboard">

          <button
            className="back-button"
            onClick={
              artistDashboardSection === "home"
                ? goHome
                : () => setArtistDashboardSection("home")
            }
          >
            {artistDashboardSection === "home"
              ? "← Back to Home"
              : "← Back to Dashboard"}
          </button>


          {/* ========== DASHBOARD HOME ========== */}

          {artistDashboardSection === "home" && (

            <DashboardHome
              setArtistDashboardSection={setArtistDashboardSection}
              customRequests={customRequests}
              orders={orders}
              personalizedProducts={personalizedProducts}
              artworks={artworks}
              user={user}
            />

          )}


          {/* ========== ACCOUNT SECURITY ========== */}

          {artistDashboardSection === "security" && (

            <SecuritySection
              user={user}
              twoFactorSetup={twoFactorSetup}
              setTwoFactorSetup={setTwoFactorSetup}
              handleStartTwoFactorSetup={handleStartTwoFactorSetup}
              handleEnableTwoFactor={handleEnableTwoFactor}
              handleDisableTwoFactor={handleDisableTwoFactor}
            />

          )}


          {/* ========== CUSTOM REQUESTS ========== */}

          {artistDashboardSection === "requests" && (

            <CustomRequestsSection
              customRequests={customRequests}
              updateRequestStatus={updateRequestStatus}
              deleteCustomRequest={deleteCustomRequest}
            />

          )}


          {/* ========== DESIGN REQUESTS ========== */}

          {artistDashboardSection === "designs" && (

            <Suspense
              fallback={
                <p>Loading design requests...</p>
              }
            >
              <DesignRequestsAdmin
                authToken={authToken}
                showNotification={showNotification}
                showConfirm={showConfirm}
              />
            </Suspense>

          )}


          {/* ========== CUSTOMER ORDERS ========== */}

          {artistDashboardSection === "orders" && (

            <OrdersSection
              orders={orders}
              updateOrderStatus={updateOrderStatus}
              deletePersonalizedOrder={deletePersonalizedOrder}
            />

          )}


          {/* ========== PERSONALIZED PRODUCTS ========== */}

          {artistDashboardSection === "products" && (

            <ProductsSection
              showAddProductForm={showAddProductForm}
              handleAddProduct={handleAddProduct}
              personalizedProducts={personalizedProducts}
              setShowAddProductForm={setShowAddProductForm}
              editingProduct={editingProduct}
              handleEditProduct={handleEditProduct}
              setEditingProduct={setEditingProduct}
              displayedPersonalizedProducts={displayedPersonalizedProducts}
              giftCategories={giftCategories}
              toggleProductActive={toggleProductActive}
              toggleProductStock={toggleProductStock}
              deleteProduct={deleteProduct}
            />

          )}


          {/* ========== MANAGE FEATURED ARTS ========== */}

          {artistDashboardSection === "artworks" && (

            <FeaturedArtsSection
              showAddArtworkForm={showAddArtworkForm}
              handleAddArtwork={handleAddArtwork}
              setShowAddArtworkForm={setShowAddArtworkForm}
              editingArtwork={editingArtwork}
              handleEditArtwork={handleEditArtwork}
              setEditingArtwork={setEditingArtwork}
              artworks={artworks}
              displayedArtworks={displayedArtworks}
              toggleArtworkFeatured={toggleArtworkFeatured}
              deleteArtwork={deleteArtwork}
            />

          )}

        </section>





      ) : showDesigner ? (

        /* ================= DESIGN YOUR GIFT IDEA ================= */

        <Suspense
          fallback={
            <div className="gallery-loading" role="status">
              <h3>Loading the designer...</h3>
            </div>
          }
        >
          <Designer
            leaveDesigner={leaveDesigner}
            designerBackLabel={designerBackLabel}
            designerSource={designerSource}
            designerGift={designerGift}
            designerArtwork={designerArtwork}
            personalizedLoading={personalizedLoading}
            artworksLoading={artworksLoading}
            openDesigner={openDesigner}
          />
        </Suspense>

      ) : selectedArtwork ? (

        /* ================= ARTWORK DETAIL ================= */

        <ArtworkDetail
          backToGallery={backToGallery}
          selectedArtwork={selectedArtwork}
          setRequestFormType={setRequestFormType}
          setCustomRequestArtwork={setCustomRequestArtwork}
          setSelectedArtwork={setSelectedArtwork}
          setRequestSubmitted={setRequestSubmitted}
          setShowRequestForm={setShowRequestForm}
          openPersonalized={openPersonalized}
          openDesigner={openDesigner}
        />

      ) : showProduct && selectedPersonalizedProduct ? (

        /* ================= PRODUCT DETAIL ================= */

        <GiftDetail
          setShowProduct={setShowProduct}
          setSelectedPersonalizedProduct={setSelectedPersonalizedProduct}
          setShowPersonalized={setShowPersonalized}
          selectedPersonalizedProduct={selectedPersonalizedProduct}
          customText={customText}
          setCustomText={setCustomText}
          letterCount={letterCount}
          addToCart={addToCart}
          openDesigner={openDesigner}
        />




      ) : showPersonalized ? (

        /* ================= PERSONALIZED MICROARTS ================= */

        <PersonalizedGallery
          goHome={goHome}
          personalizedLoading={personalizedLoading}
          personalizedError={personalizedError}
          loadPersonalizedProducts={loadPersonalizedProducts}
          personalizedProducts={personalizedProducts}
          filteredPersonalizedProducts={filteredPersonalizedProducts}
          giftCategories={giftCategories}
          giftCategoryFilter={activeGiftCategory}
          setGiftCategoryFilter={setGiftCategoryFilter}
          giftSearch={giftSearch}
          setGiftSearch={setGiftSearch}
          setCustomText={setCustomText}
          setSelectedPersonalizedProduct={setSelectedPersonalizedProduct}
          setShowProduct={setShowProduct}
          openDesigner={openDesigner}
        />


      ) : (

        /* ================= HOME ================= */

        <Home
          openPersonalized={openPersonalized}
          artworksLoading={artworksLoading}
          artworksError={artworksError}
          loadArtworks={loadArtworks}
          displayedArtworks={displayedArtworks}
          openArtwork={openArtwork}
          setRequestFormType={setRequestFormType}
          setCustomRequestArtwork={setCustomRequestArtwork}
          setRequestSubmitted={setRequestSubmitted}
          setShowRequestForm={setShowRequestForm}
          openDesigner={openDesigner}
        />

      )}


      {/* ================= CUSTOM REQUEST MODAL ================= */}

      {showRequestForm && (

        <CustomRequestModal
          requestFormType={requestFormType}
          customRequestArtwork={customRequestArtwork}
          setShowRequestForm={setShowRequestForm}
          setRequestSubmitted={setRequestSubmitted}
          setCustomRequestArtwork={setCustomRequestArtwork}
          setRequestFormType={setRequestFormType}
          requestSubmitted={requestSubmitted}
          showNotification={showNotification}
          openDesigner={openDesigner}
        />

      )}
    <Footer />

    </div>
  )

}

export default App