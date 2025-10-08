// ...existing code...
import React, { useState, useEffect, useRef } from "react";
import { designs } from "../../constants";

const Designs = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // zoom / pan states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleOpenModal = (design) => {
    setSelectedProject(design);
    setCurrentImageIndex(0);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Normalize various legacy shapes to a unified media array:
  // media: [{ type: 'image'|'video', src, poster? }, ...]
  const mediaFor = (design) => {
    if (!design) return [];
    if (Array.isArray(design.media) && design.media.length) return design.media;
    if (Array.isArray(design.images) && design.images.length)
      return design.images.map((s) => ({ type: "image", src: s }));
    if (design.image) {
      if (Array.isArray(design.image))
        return design.image.map((s) => ({ type: "image", src: s }));
      return [{ type: "image", src: design.image }];
    }
    return [];
  };

  // Backwards helper kept if some parts still expect plain image arrays:
  const imagesFor = (design) => mediaFor(design).filter((m) => m.type === "image").map((m) => m.src);

  // preview before clicking: image src or video poster (or video src)
  const previewFor = (design) => {
    const first = mediaFor(design)[0];
    if (!first) return "";
    return first.type === "image" ? first.src : first.poster || first.src;
  };

  const showPrev = () => {
    if (!selectedProject) return;
    const m = mediaFor(selectedProject);
    if (!m.length) return;
    setCurrentImageIndex((idx) => (idx - 1 + m.length) % m.length);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const showNext = () => {
    if (!selectedProject) return;
    const m = mediaFor(selectedProject);
    if (!m.length) return;
    setCurrentImageIndex((idx) => (idx + 1) % m.length);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (!selectedProject) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleCloseModal();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)));
      if (e.key === "-") setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject]);

  // pan handlers (mouse) - only meaningful for images when zoom > 1
  const onMouseDown = (e) => {
    const current = mediaFor(selectedProject)[currentImageIndex];
    if (!current || current.type !== "image" || zoom <= 1) return;
    isPanningRef.current = true;
    startRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    document.body.style.cursor = "grabbing";
  };
  const onMouseMove = (e) => {
    if (!isPanningRef.current) return;
    setPan({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y });
  };
  const onMouseUp = () => {
    isPanningRef.current = false;
    document.body.style.cursor = "";
  };

  // touch pan
  const onTouchStart = (e) => {
    const current = mediaFor(selectedProject)[currentImageIndex];
    if (!current || current.type !== "image" || zoom <= 1) return;
    const t = e.touches[0];
    isPanningRef.current = true;
    startRef.current = { x: t.clientX - pan.x, y: t.clientY - pan.y };
  };
  const onTouchMove = (e) => {
    if (!isPanningRef.current) return;
    const t = e.touches[0];
    setPan({ x: t.clientX - startRef.current.x, y: t.clientY - startRef.current.y });
  };
  const onTouchEnd = () => {
    isPanningRef.current = false;
  };

  // wheel to zoom (only affects images)
  const onWheel = (e) => {
    const current = mediaFor(selectedProject)[currentImageIndex];
    if (!current || current.type !== "image") return;
    const delta = e.deltaY;
    if (delta > 0) {
      setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)));
    } else {
      setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)));
    }
  };

  // reset pan when zoom resets to 1
  useEffect(() => {
    if (zoom <= 1) setPan({ x: 0, y: 0 });
  }, [zoom]);

  const currentMedia = selectedProject ? mediaFor(selectedProject)[currentImageIndex] : null;

  return (
    <section
      id="work"
      className="py-24 pb-24 px-[12vw] md:px-[7vw] lg:px-[20vw] font-sans relative"
    >
      {/* Section Title */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white">GRAPHIC DESIGN (under maintenance)</h2>
        <div className="w-32 h-1 bg-purple-500 mx-auto mt-4"></div>
        <p className="text-gray-400 mt-4 text-lg font-semibold">
          A showcase of my designs I have worked on, highlighting my skills
          and experience in Graphic and UI/UX Design
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {designs.map((design) => {
          const preview = previewFor(design) || "";
          return (
            <div
              key={design.id}
              onClick={() => handleOpenModal(design)}
              className="border border-white bg-white backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden cursor-pointer hover:shadow-purple-500/50 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="p-4">
                <img
                  src={preview}
                  alt={design.title}
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-black mb-2">
                  {design.title}
                </h3>
                <p className="text-gray-500 mb-4 pt-4 line-clamp-3">
                  {design.description}
                </p>
                <div className="mb-4">
                  {design.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-black text-xs font-semibold text-white rounded-full px-2 py-1 mr-2 mb-2"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Container */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="bg-gray-900 rounded-xl shadow-2xl lg:w-full w-[90%] max-w-3xl overflow-hidden relative">
            <div className="flex justify-end p-4">
              <button
                onClick={handleCloseModal}
                className="text-white text-3xl font-bold hover:text-[#d3f463]"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col">
              <div
                ref={containerRef}
                className="w-full flex justify-center bg-gray-900 px-4 relative overflow-hidden"
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                onWheel={onWheel}
              >
                {/* Prev button */}
                {mediaFor(selectedProject).length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showPrev();
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl px-3 py-1 bg-black/40 rounded-full hover:bg-black/60"
                    aria-label="Previous media"
                  >
                    ‹
                  </button>
                )}

                {/* Media render */}
                {currentMedia?.type === "image" ? (
                  <img
                    src={currentMedia.src}
                    alt={`${selectedProject.title} ${currentImageIndex + 1}`}
                    className="lg:w-full w-[95%] object-contain rounded-xl shadow-2xl select-none"
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      transition: isPanningRef.current ? "none" : "transform 120ms ease",
                      cursor: zoom > 1 ? (isPanningRef.current ? "grabbing" : "grab") : "auto",
                    }}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                ) : currentMedia?.type === "video" ? (
                  <video
                    src={currentMedia.src}
                    poster={currentMedia.poster}
                    controls
                    className="lg:w-full w-[95%] rounded-xl shadow-2xl bg-black"
                    style={{ transform: "none" }}
                  />
                ) : (
                  <div className="text-white py-20">No media</div>
                )}

                {/* Next button */}
                {mediaFor(selectedProject).length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showNext();
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl px-3 py-1 bg-black/40 rounded-full hover:bg-black/60"
                    aria-label="Next media"
                  >
                    ›
                  </button>
                )}
              </div>

              <div className="lg:p-8 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="lg:text-3xl font-bold text-white mb-2 text-md">
                      {selectedProject.title}
                    </h3>
                    <p className="text-gray-400 mb-0 lg:text-base text-xs">
                      {selectedProject.description}
                    </p>
                  </div>

                  {/* Zoom controls - only useful for images */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
                      className="bg-gray-800 text-white px-3 py-1 rounded-md"
                      aria-label="Zoom out"
                      disabled={currentMedia?.type !== "image"}
                    >
                      −
                    </button>
                    <div className="text-sm text-gray-300 px-2">{(zoom * 100).toFixed(0)}%</div>
                    <button
                      onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                      className="bg-gray-800 text-white px-3 py-1 rounded-md"
                      aria-label="Zoom in"
                      disabled={currentMedia?.type !== "image"}
                    >
                      +
                    </button>
                    <button
                      onClick={() => {
                        setZoom(1);
                        setPan({ x: 0, y: 0 });
                      }}
                      className="bg-gray-700 text-gray-200 px-3 py-1 rounded-md"
                      aria-label="Reset zoom"
                      disabled={currentMedia?.type !== "image"}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedProject.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-[#251f38] text-xs font-semibold text-purple-500 rounded-full px-2 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Thumbnails */}
                {mediaFor(selectedProject).length > 1 && (
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {mediaFor(selectedProject).map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentImageIndex(idx);
                          setZoom(1);
                          setPan({ x: 0, y: 0 });
                        }}
                        className={`relative rounded-md overflow-hidden border ${
                          idx === currentImageIndex ? "border-purple-500" : "border-transparent"
                        }`}
                      >
                        {m.type === "image" ? (
                          <img src={m.src} alt={`thumb-${idx}`} className="w-20 h-12 object-cover" />
                        ) : m.poster ? (
                          <img src={m.poster} alt={`thumb-${idx}`} className="w-20 h-12 object-cover" />
                        ) : (
                          <div className="w-20 h-12 bg-black flex items-center justify-center text-xs text-white">
                            ▶ Video
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Designs;
// ...existing code...