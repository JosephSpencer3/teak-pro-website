/* TeakPro admin price estimator — client-side only.
 *
 * The model is a linear regression fitted on all 18 rows (matches estimate.py):
 *   price = INTERCEPT + hours*Ch + age*Ca + set_quality*Cq + reffered*Cr + num_pieces*Cp
 *
 * NOTE ON SECURITY: the passphrase gate below is obscurity + a soft lock, not real
 * security. Anyone who opens this file can read the model and bypass the gate. It only
 * keeps casual visitors out. The page is also unlinked from the site nav.
 * To swap the passphrase, replace GATE_HASH with the SHA-256 hex of your new passphrase.
 */

(function () {
  "use strict";

  // --- Model coefficients (full 18-row LinearRegression fit) ---
  var INTERCEPT = -544.1175194230966;
  var COEF = {
    hours: 47.527970599195754,
    age: 53.40826788244133,
    set_quality: 97.63449271365634,
    reffered: 182.9423896406621,
    num_pieces: -6.986624818421312,
  };

  // --- Gate config ---
  // SHA-256 hex of the passphrase (the passphrase itself is never stored in plaintext).
  // To rotate: set this to the SHA-256 hex of the new passphrase.
  var GATE_HASH = "35e24e933b03d23b3db089469f7ef5406cd358d721380162c8e31a817bf22221";
  var GATE_KEY = "tp_admin_unlocked";

  var gate = document.getElementById("gate");
  var gateForm = document.getElementById("gate-form");
  var gateInput = document.getElementById("gate-input");
  var gateErr = document.getElementById("gate-err");
  var app = document.getElementById("app");

  // --- Estimator field refs (must be assigned before any unlock()/recalc() call) ---
  var elHours = document.getElementById("f-hours");
  var elAge = document.getElementById("f-age");
  var elQuality = document.getElementById("f-quality");
  var elPieces = document.getElementById("f-pieces");
  var elReferred = document.getElementById("f-referred");
  var elReferredVal = elReferred.querySelector(".adm-toggle__val");
  var elPrice = document.getElementById("price");

  // --- Hashing helper (SubtleCrypto; requires secure context: https or localhost) ---
  function sha256Hex(text) {
    var data = new TextEncoder().encode(text);
    return crypto.subtle.digest("SHA-256", data).then(function (buf) {
      var bytes = new Uint8Array(buf);
      var hex = "";
      for (var i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, "0");
      }
      return hex;
    });
  }

  function unlock() {
    gate.hidden = true;
    app.hidden = false;
    recalc();
  }

  function lock() {
    try { localStorage.removeItem(GATE_KEY); } catch (e) {}
    app.hidden = true;
    gate.hidden = false;
    gateInput.value = "";
    gateErr.textContent = "";
    gateInput.focus();
  }

  // Already unlocked this browser?
  var alreadyIn = false;
  try { alreadyIn = localStorage.getItem(GATE_KEY) === "1"; } catch (e) {}
  if (alreadyIn) {
    unlock();
  } else {
    gateInput.focus();
  }

  gateForm.addEventListener("submit", function (e) {
    e.preventDefault();
    gateErr.textContent = "";
    var attempt = gateInput.value;
    if (!crypto || !crypto.subtle) {
      gateErr.textContent = "Secure context required (use https or localhost).";
      return;
    }
    sha256Hex(attempt).then(function (hex) {
      if (hex === GATE_HASH) {
        try { localStorage.setItem(GATE_KEY, "1"); } catch (e) {}
        unlock();
      } else {
        gateErr.textContent = "Incorrect passphrase.";
        gateInput.select();
      }
    });
  });

  // --- Estimator ---
  function num(el) {
    var v = parseFloat(el.value);
    return isNaN(v) ? 0 : v;
  }

  function recalc() {
    var referred = elReferred.getAttribute("aria-checked") === "true" ? 1 : 0;
    var price =
      INTERCEPT +
      COEF.hours * num(elHours) +
      COEF.age * num(elAge) +
      COEF.set_quality * num(elQuality) +
      COEF.reffered * referred +
      COEF.num_pieces * num(elPieces);

    // Model can produce negatives on tiny/degenerate inputs; floor the display at $0.
    var shown = Math.max(0, Math.round(price));
    elPrice.textContent = "$" + shown.toLocaleString("en-US");
  }

  [elHours, elAge, elQuality, elPieces].forEach(function (el) {
    el.addEventListener("input", recalc);
  });

  elReferred.addEventListener("click", function () {
    var on = elReferred.getAttribute("aria-checked") === "true";
    elReferred.setAttribute("aria-checked", on ? "false" : "true");
    elReferredVal.textContent = on ? "No" : "Yes";
    recalc();
  });

  document.getElementById("lock-btn").addEventListener("click", lock);
})();
