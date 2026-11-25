// =====================================================
// SHARED DESIGN MODULES
// =====================================================
//
// The designer's pricing and validation, and the phone rules
// used by every customer form, live in the
// repo-root shared/ folder (ES modules), so the website
// and the server use exactly the same rules.
//
// server.js loads them at startup, so a deploy that
// cannot see shared/ fails instead of serving requests.

const path =
  require("path")

const { pathToFileURL } =
  require("url")


const sharedFile =
  (name) =>
    pathToFileURL(
      path.join(
        __dirname,
        "..",
        "..",
        "shared",
        name
      )
    ).href


let loading = null


const loadSharedDesign =
  () => {

    if (!loading) {
      loading =
        Promise.all([
          import(
            sharedFile("designPricing.js")
          ),
          import(
            sharedFile("designValidation.js")
          ),
          import(
            sharedFile("designRules.js")
          ),
          import(
            sharedFile("contactRules.js")
          ),
        ]).then(
          ([
            pricing,
            validation,
            rules,
            contact,
          ]) => ({
            ...pricing,
            ...validation,
            ...rules,
            ...contact,
          })
        )
    }


    return loading
  }


module.exports = {
  loadSharedDesign,
}
