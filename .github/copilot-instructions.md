**Purpose**
- **What:** Quick, actionable guidance for AI coding agents to be productive in this Express + Mongoose codebase.
- **Goal:** Provide the minimal, concrete knowledge an agent needs to make correct edits, add routes/controllers, and run the app.

**Big Picture**
- **Stack:** Node.js + Express server (`app.js`), MongoDB via Mongoose, EJS views in `views/`.
- **Structure:** Routes in `routes/` delegate to controllers in `controllers/`. Models live in `models/`. Shared utilities and middleware are in `utils/` and root `middleware.js`.
- **Why:** Separation keeps controllers thin (business logic) and routes small (wrapping + middleware). Use `wrapAsync` for async error handling and `ExpressError` for consistent error payloads.

**Key Files & Patterns (use these as canonical examples)**
- **App entry:** `app.js` — DB connect (local `mongodb://127.0.0.1:27017/wanderlust`), session + flash + passport setup, error handler renders `views/error.ejs`, listens on port `8080`.
- **Routes:** `routes/listing.js` — uses `router.route()` with chained handlers and composes middlewares like `isLoggedIn`, `validateListing`, and `isOwner`. Example: `router.route("/").get(wrapAsync(listingController.index)).post(isLoggedIn, validateListing, wrapAsync(listingController.createListing));`
- **Controllers:** `controllers/listing.js` — each exported function follows `module.exports.<name> = async (req,res)=>{}` and renders EJS views or redirects. Use `req.body.listing` shape when creating/updating listings.
- **Middleware:** `middleware.js` — contains `validateListing`, `validateReview`, `isLoggedIn`, `isOwner`, `isReviewAuthor`, `saveRedirectUrl`. Middleware often sets `req.session` keys (`redirectUrl` or `returnTo`) and `res.locals` for templates (`res.locals.currUser`, `res.locals.successMsg`).
- **Models:** `models/listing.js` — shows relationships: `reviews: [ObjectId ref: "Review"]` and `owner: ObjectId ref: "User"`. Deletion uses `post('findOneAndDelete')` to cascade remove reviews.

**Validation & Errors**
- **Joi schemas:** `schema.js` contains `listingSchema` and `reviewSchema`. Middleware uses these to validate incoming `req.body` and throws `ExpressError` on failure.
- **Async errors:** Always wrap async route handlers with `wrapAsync` (from `utils/wrapAsync.js`) instead of try/catch in routes.
- **Centralized handler:** `app.js` final error middleware expects `{status, message}` and renders `error.ejs`. If available, it will read `req.session.returnTo` to compute `returnTo` link.

**Auth & Sessions**
- **Passport:** configured in `app.js` with `passport-local` and `passport-local-mongoose` on `models/user.js`. Use `req.isAuthenticated()` in `isLoggedIn` middleware.
- **Redirect flow:** Two session keys are used in code: `req.session.redirectUrl` (set in `isLoggedIn`) and `req.session.returnTo` (set in validation middleware). Be careful to preserve intended semantics when modifying redirect logic; see `middleware.js` and `app.js` error handler.

**Development / Run**
- **Start:** No `start` npm script exists. Run locally with `node app.js` or `npx nodemon app.js`.
- **DB:** Expects MongoDB at `mongodb://127.0.0.1:27017/wanderlust` (change `MONGO_URL` in `app.js` to point elsewhere).

**Conventions & Small Rules**
- **Request body shape:** Listings use `req.body.listing` (e.g., `req.body.listing.image`). When adding forms/views, ensure inputs are namespaced as `listing[title]`, `listing[price]`, etc.
- **Views:** EJS templates live under `views/` grouped by resource (e.g. `views/listings/*.ejs`). Controllers render with the template name and an object (e.g., `res.render("listings/show.ejs", {listing})`).
- **Flash messages:** Use `req.flash("success", "msg")` and `req.flash("error", "msg")`. Templates expect `res.locals.successMsg` and `res.locals.errorMsg` (set in `app.js`).
- **Ownership checks:** `isOwner` compares `listing.owner.equals(res.locals.currUser._1d)` — be mindful of ObjectId equality; use `.equals()`.

**How to add a new resource (quick recipe)**
1. Add a model in `models/` (follow `models/listing.js` conventions).
2. Add controller file in `controllers/` with exported handlers (index, show, create, update, delete, renderNewForm, renderEditForm).
3. Add routes in `routes/` wiring middleware and `wrapAsync` around every async controller method.
4. Add EJS views under `views/<resource>/` using `res.locals` variables for user/flash.

**Examples to copy/paste**
- Route wiring: `router.route("/:id").get(wrapAsync(ctrl.show)).put(isLoggedIn, isOwner, validateListing, wrapAsync(ctrl.update)).delete(isLoggedIn, isOwner, wrapAsync(ctrl.delete));`
- Validation middleware pattern: `const {error} = listingSchema.validate(req.body); if(error){ req.session.returnTo = req.originalUrl; throw new ExpressError(error.details.map(el => el.message).join(","), 400); }`

**Files worth reading first**
- `app.js`, `middleware.js`, `schema.js`, `routes/listing.js`, `controllers/listing.js`, `models/listing.js`, `utils/wrapAsync.js`, `utils/ExpressError.js`, `views/error.ejs`.

**When to ask the human**
- If a change affects session redirect semantics (`redirectUrl` vs `returnTo`) — ask before modifying.
- If adding new environment config (DB URL, session secret, ports) — prefer using env vars and confirm desired names.

Please review and tell me if you want more examples (controller templates, a `start` npm script, or environment variable support).