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
      window.opener?.postMessage(
        {
          type: "OAUTH_ERROR",
          error:
            error === "oauth_error"
              ? `Erreur d'authentification avec ${provider}`
              : error,
        },
        window.location.origin
      );
      window.close();
      return;
    }

    if (!accessToken || !refreshToken || success !== "true") {
      console.error("OAuth incomplete data");
      window.opener?.postMessage(
        {
          type: "OAUTH_ERROR",
          error: "Authentification OAuth incomplète",
        },
        window.location.origin
      );
      window.close();
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

        window.opener?.postMessage(
          {
            type: "OAUTH_SUCCESS",
            access_token: accessToken,
            refresh_token: refreshToken,
            user: userData,
          },
          window.location.origin
        );

        window.close();
      })
      .catch((error) => {
        console.error("Failed to get user data:", error);
        window.opener?.postMessage(
          {
            type: "OAUTH_ERROR",
            error:
              error.message ||
              "Erreur lors de la récupération des données utilisateur",
          },
          window.location.origin
        );
        window.close();
      });
  } catch (error) {
    console.error("OAuth callback processing error:", error);
    window.opener?.postMessage(
      {
        type: "OAUTH_ERROR",
        error: "Erreur lors du traitement de l'authentification",
      },
      window.location.origin
    );
    window.close();
  }
})();
