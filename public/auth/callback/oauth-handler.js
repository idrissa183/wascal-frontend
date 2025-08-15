(function () {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");
    const userId = urlParams.get("user_id");
    const success = urlParams.get("success");
    const error = urlParams.get("error");
    const provider = window.location.pathname
      .split("/")
      .pop()
      .replace(".html", "");

    console.log("OAuth callback received:", {
      accessToken: accessToken ? "present" : "missing",
      refreshToken: refreshToken ? "present" : "missing",
      userId,
      success,
      error,
      provider,
    });

    if (error) {
      console.error("OAuth error:", error);
      
      const isPopup = window.opener && window.opener !== window;
      const errorMsg = error === "oauth_error"
        ? `Erreur d'authentification avec ${provider}`
        : error;
      
      if (isPopup) {
        window.opener.postMessage(
          {
            type: "OAUTH_ERROR",
            error: errorMsg,
          },
          window.location.origin
        );
        window.close();
      } else {
        // Same-tab context - redirect to login with error
        window.location.replace(`/auth/login?error=${encodeURIComponent(errorMsg)}`);
      }
      return;
    }

    if (!accessToken || !refreshToken || success !== "true") {
      console.error("OAuth incomplete data");
      
      const isPopup = window.opener && window.opener !== window;
      
      if (isPopup) {
        window.opener.postMessage(
          {
            type: "OAUTH_ERROR",
            error: "Authentification OAuth incomplète",
          },
          window.location.origin
        );
        window.close();
      } else {
        // Same-tab context - redirect to login with error
        window.location.replace('/auth/login?error=Authentification%20OAuth%20incomplète');
      }
      return;
    }

    // Déterminer l'URL de l'API
    const apiUrl =
      window.location.hostname === "localhost"
        ? "http://localhost:8000"
        : "https://wascal-backend.onrender.com";

    fetch(`${apiUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Impossible de récupérer les informations utilisateur"
          );
        }
        return response.json();
      })
      .then((userData) => {
        console.log("User data retrieved:", userData);

        // Store tokens in localStorage
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);

        // Detect if we're in a popup or same-tab context
        const isPopup = window.opener && window.opener !== window;
        console.log('OAuth handler context:', { isPopup, hasOpener: !!window.opener });

        if (isPopup) {
          // We're in a popup - send message to parent and close
          console.log('Popup: sending success message to parent');
          
          window.opener.postMessage(
            {
              type: "OAUTH_SUCCESS",
              access_token: accessToken,
              refresh_token: refreshToken,
              user: userData,
            },
            window.location.origin
          );

          window.close();
        } else {
          // We're in same-tab context - redirect to dashboard
          console.log('Same-tab: redirecting to dashboard');
          
          // Clean up URL and redirect
          window.location.replace('/dashboard');
        }
      })
      .catch((error) => {
        console.error("Failed to get user data:", error);
        
        const isPopup = window.opener && window.opener !== window;
        
        if (isPopup) {
          window.opener.postMessage(
            {
              type: "OAUTH_ERROR",
              error:
                error.message ||
                "Erreur lors de la récupération des données utilisateur",
            },
            window.location.origin
          );
          window.close();
        } else {
          // Same-tab context - redirect to login with error
          const errorMsg = encodeURIComponent(
            error.message || "Erreur lors de la récupération des données utilisateur"
          );
          window.location.replace(`/auth/login?error=${errorMsg}`);
        }
      });
  } catch (error) {
    console.error("OAuth callback processing error:", error);
    
    const isPopup = window.opener && window.opener !== window;
    
    if (isPopup) {
      window.opener.postMessage(
        {
          type: "OAUTH_ERROR",
          error: "Erreur lors du traitement de l'authentification",
        },
        window.location.origin
      );
      window.close();
    } else {
      // Same-tab context - redirect to login with error
      window.location.replace('/auth/login?error=Erreur%20d%27authentification');
    }
  }
})();
