import React, { useEffect, useState } from "react";
import api from "../services/api";

export function AdminPage({ onLogout }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados de Paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const limit = 20;

  // Estados para exclusão
  const [deletingId, setDeletingId] = useState(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);

  // Mídia atualmente ampliada no lightbox
  const [selectedMedia, setSelectedMedia] = useState(null);

  const token = localStorage.getItem("@photo-event:token");

  useEffect(() => {
    if (!token) {
      if (onLogout) onLogout();
      return;
    }

    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/submissions", {
          params: { page, limit },
        });

        const resData = response.data;

        const list = Array.isArray(resData)
          ? resData
          : resData?.data || resData?.submissions || [];

        setSubmissions(list);

        if (resData?.pagination) {
          setTotalPages(resData.pagination.totalPages || 1);
          setTotalSubmissions(resData.pagination.total || list.length);
        } else {
          setTotalPages(1);
          setTotalSubmissions(list.length);
        }
      } catch (err) {
        console.error("Erro ao carregar submissões:", err);

        setError(
          err.response?.data?.error ||
          "Erro ao carregar a lista de submissões."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [token, onLogout, page]);

  // Permite fechar o lightbox com a tecla ESC
  useEffect(() => {
    if (!selectedMedia) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedMedia(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedMedia]);

  if (!token) return null;

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  // Abre a mídia no lightbox
  const handleOpenMedia = (media) => {
    setSelectedMedia(media);
  };

  // Fecha o lightbox
  const handleCloseMedia = () => {
    setSelectedMedia(null);
  };

  // Exclusão da submissão inteira
  const handleDelete = async (id, visitorName) => {
    const confirmMessage = `Tem certeza que deseja excluir a submissão de "${visitorName || "Anônimo"
      }"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setDeletingId(id);

      await api.delete(`/admin/submissions/${id}`);

      // Se a mídia excluída estiver aberta no lightbox, fecha
      setSelectedMedia((current) =>
        current?.submissionId === id ? null : current
      );

      if (submissions.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        setSubmissions((prev) =>
          prev.filter((sub) => sub.id !== id)
        );
      }

      setTotalSubmissions((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erro ao excluir submissão:", err);

      const message =
        err.response?.data?.error ||
        "Erro ao tentar excluir a submissão.";

      alert(message);
    } finally {
      setDeletingId(null);
    }
  };

  // Exclusão de mídia individual
  const handleDeletePhoto = async (submissionId, photoId) => {
    const confirmMessage =
      "Tem certeza que deseja excluir esta mídia permanentemente?";

    if (!window.confirm(confirmMessage)) return;

    try {
      setDeletingPhotoId(photoId);

      await api.delete(`/admin/photos/${photoId}`);

      // Se a mídia excluída estiver aberta, fecha o lightbox
      setSelectedMedia((current) =>
        current?.photoId === photoId ? null : current
      );

      setSubmissions((prevSubmissions) =>
        prevSubmissions.map((sub) => {
          if (sub.id === submissionId) {
            return {
              ...sub,
              photos: Array.isArray(sub.photos)
                ? sub.photos.filter((p) => p.id !== photoId)
                : [],
            };
          }

          return sub;
        })
      );
    } catch (err) {
      console.error("Erro ao excluir mídia:", err);

      const message =
        err.response?.data?.error ||
        "Erro ao tentar excluir a mídia.";

      alert(message);
    } finally {
      setDeletingPhotoId(null);
    }
  };

  // Download individual da mídia no navegador
  const handleDownloadPhoto = async (
    photoUrl,
    photoId,
    mediaType
  ) => {
    try {
      const response = await fetch(photoUrl);

      if (!response.ok) {
        throw new Error("Falha ao baixar a mídia.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      let ext = "jpg";

      if (mediaType === "video") {
        if (blob.type === "video/quicktime") {
          ext = "mov";
        } else if (blob.type === "video/webm") {
          ext = "webm";
        } else {
          ext = "mp4";
        }
      } else if (blob.type === "image/png") {
        ext = "png";
      } else if (blob.type === "image/webp") {
        ext = "webp";
      } else if (blob.type === "image/heic") {
        ext = "heic";
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = `midia-${photoId}.${ext}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao baixar mídia:", err);
      alert("Não foi possível fazer o download da mídia.");
    }
  };

  return (
    <>
      <div
        style={{
          maxWidth: "900px",
          margin: "40px auto",
          padding: "20px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Cabeçalho */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            borderBottom: "1px solid #eee",
            paddingBottom: "16px",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "24px" }}>
              Painel Administrativo
            </h1>

            {totalSubmissions > 0 && (
              <span
                style={{
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                Total de Submissões: {totalSubmissions}
              </span>
            )}
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                backgroundColor: "#d32f2f",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontWeight: "bold",
              }}
            >
              Sair (Logout)
            </button>
          )}
        </header>

        {/* Estado: Carregando */}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "#666",
            }}
          >
            <p>Carregando submissões...</p>
          </div>
        )}

        {/* Estado: Erro */}
        {!loading && error && (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#ffebee",
              border: "1px solid #ffcdd2",
              borderRadius: "6px",
              color: "#c62828",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {/* Estado: Sem submissões */}
        {!loading && !error && submissions.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              border: "1px solid #eee",
              color: "#666",
            }}
          >
            <p>Nenhuma submissão encontrada.</p>
          </div>
        )}

        {/* Estado: Lista de Submissões */}
        {!loading && !error && submissions.length > 0 && (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {submissions.map((sub) => {
                const photoCount = sub.photos?.length || 0;

                const formattedDate = sub.created_at
                  ? new Date(sub.created_at).toLocaleString("pt-BR")
                  : "Data não informada";

                const isDeletingSub = deletingId === sub.id;

                return (
                  <div
                    key={sub.id}
                    style={{
                      padding: "16px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "16px" }}>
                          Nome: {sub.visitor_name || "Anônimo"}
                        </strong>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#888",
                            marginTop: "2px",
                          }}
                        >
                          Data: {formattedDate}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          handleDelete(sub.id, sub.visitor_name)
                        }
                        disabled={isDeletingSub}
                        style={{
                          padding: "6px 12px",
                          cursor: isDeletingSub
                            ? "not-allowed"
                            : "pointer",
                          backgroundColor: isDeletingSub
                            ? "#999"
                            : "#dc3545",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "13px",
                          fontWeight: "bold",
                        }}
                      >
                        {isDeletingSub
                          ? "Excluindo..."
                          : "Excluir Submissão Inteira"}
                      </button>
                    </div>

                    {sub.visitor_group && (
                      <p
                        style={{
                          margin: "0 0 8px 0",
                          fontSize: "14px",
                          color: "#555",
                        }}
                      >
                        <strong>Grupo:</strong>{" "}
                        {sub.visitor_group}
                      </p>
                    )}

                    {sub.message && (
                      <p
                        style={{
                          margin: "0 0 12px 0",
                          fontSize: "14px",
                          color: "#333",
                          backgroundColor: "#f8f9fa",
                          padding: "8px 12px",
                          borderRadius: "4px",
                          fontStyle: "italic",
                        }}
                      >
                        <strong>Mensagem:</strong> "{sub.message}"
                      </p>
                    )}

                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "bold",
                        color: "#0070f3",
                        marginBottom:
                          photoCount > 0 ? "12px" : "0",
                      }}
                    >
                      📷 {photoCount}{" "}
                      {photoCount === 1 ? "mídia" : "mídias"}
                    </div>

                    {/* Grade de Mídias com Ações */}
                    {Array.isArray(sub.photos) &&
                      sub.photos.length > 0 ? (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(160px, 1fr))",
                          gap: "12px",
                          marginTop: "12px",
                        }}
                      >
                        {sub.photos.map((photo, index) => {
                          const isDeletingThisPhoto =
                            deletingPhotoId === photo.id;

                          const isVideo =
                            photo.media_type === "video";

                          const mediaUrl =
                            photo.url || photo.signedUrl;

                          return (
                            <div
                              key={photo.id || index}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: "6px",
                                overflow: "hidden",
                                backgroundColor: "#f9f9f9",
                                border: "1px solid #eee",
                              }}
                            >
                              {/* Área clicável da mídia */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenMedia({
                                    url: mediaUrl,
                                    type: isVideo
                                      ? "video"
                                      : "image",
                                    photoId: photo.id,
                                    submissionId: sub.id,
                                  })
                                }
                                aria-label={
                                  isVideo
                                    ? "Ampliar vídeo"
                                    : "Ampliar foto"
                                }
                                style={{
                                  position: "relative",
                                  width: "100%",
                                  height: "140px",
                                  padding: 0,
                                  border: "none",
                                  background: "#f3f4f6",
                                  cursor: "pointer",
                                  overflow: "hidden",
                                  display: "block",
                                }}
                              >
                                {isVideo ? (
                                  <>
                                    <video
                                      src={mediaUrl}
                                      muted
                                      playsInline
                                      preload="metadata"
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                      }}
                                    />

                                    <span
                                      style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform:
                                          "translate(-50%, -50%)",
                                        width: "42px",
                                        height: "42px",
                                        borderRadius: "50%",
                                        backgroundColor:
                                          "rgba(0, 0, 0, 0.65)",
                                        color: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "20px",
                                        paddingLeft: "3px",
                                      }}
                                    >
                                      ▶
                                    </span>
                                  </>
                                ) : (
                                  <img
                                    src={mediaUrl}
                                    alt={`Mídia enviada por ${sub.visitor_name || "anônimo"
                                      }`}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      display: "block",
                                    }}
                                  />
                                )}

                                <span
                                  style={{
                                    position: "absolute",
                                    right: "8px",
                                    bottom: "8px",
                                    padding: "4px 7px",
                                    borderRadius: "4px",
                                    backgroundColor:
                                      "rgba(0, 0, 0, 0.6)",
                                    color: "#fff",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  🔍 Ampliar
                                </span>
                              </button>

                              <div
                                style={{
                                  display: "flex",
                                  width: "100%",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDownloadPhoto(
                                      mediaUrl,
                                      photo.id,
                                      photo.media_type
                                    )
                                  }
                                  style={{
                                    flex: 1,
                                    padding: "6px",
                                    cursor: "pointer",
                                    backgroundColor:
                                      "#28a745",
                                    color: "#fff",
                                    border: "none",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    borderRight:
                                      "1px solid #fff",
                                  }}
                                >
                                  Baixar
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeletePhoto(
                                      sub.id,
                                      photo.id
                                    )
                                  }
                                  disabled={
                                    isDeletingThisPhoto
                                  }
                                  style={{
                                    flex: 1,
                                    padding: "6px",
                                    cursor:
                                      isDeletingThisPhoto
                                        ? "not-allowed"
                                        : "pointer",
                                    backgroundColor:
                                      isDeletingThisPhoto
                                        ? "#ccc"
                                        : "#d32f2f",
                                    color: "#fff",
                                    border: "none",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {isDeletingThisPhoto
                                    ? "Excluindo..."
                                    : "Excluir mídia"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#888",
                          fontStyle: "italic",
                        }}
                      >
                        Nenhuma mídia restante nesta submissão.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Controles de Paginação */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "16px",
                  marginTop: "32px",
                  paddingTop: "16px",
                  borderTop: "1px solid #eee",
                }}
              >
                <button
                  onClick={handlePrevPage}
                  disabled={page <= 1}
                  style={{
                    padding: "8px 16px",
                    cursor:
                      page <= 1 ? "not-allowed" : "pointer",
                    backgroundColor:
                      page <= 1 ? "#ccc" : "#0070f3",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontWeight: "bold",
                  }}
                >
                  Anterior
                </button>

                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333",
                  }}
                >
                  Página {page} de {totalPages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={page >= totalPages}
                  style={{
                    padding: "8px 16px",
                    cursor:
                      page >= totalPages
                        ? "not-allowed"
                        : "pointer",
                    backgroundColor:
                      page >= totalPages ? "#ccc" : "#0070f3",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontWeight: "bold",
                  }}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {selectedMedia && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            selectedMedia.type === "video"
              ? "Vídeo ampliado"
              : "Foto ampliada"
          }
          onClick={handleCloseMedia}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <button
            type="button"
            onClick={handleCloseMedia}
            aria-label="Fechar mídia ampliada"
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              color: "#fff",
              fontSize: "26px",
              lineHeight: 1,
              cursor: "pointer",
              zIndex: 2,
            }}
          >
            ✕
          </button>

          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {selectedMedia.type === "video" ? (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                playsInline
                style={{
                  maxWidth: "95vw",
                  maxHeight: "90vh",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: "8px",
                  backgroundColor: "#000",
                }}
              />
            ) : (
              <img
                src={selectedMedia.url}
                alt="Mídia ampliada"
                style={{
                  maxWidth: "95vw",
                  maxHeight: "90vh",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default AdminPage;