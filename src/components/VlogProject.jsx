import React from "react";

const VlogProject = ({ title, description, youtubeSrc, thumbnail }) => (
  <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg p-6 flex flex-col items-center mb-8">
    <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
    <p className="text-white text-lg mb-4 text-center max-w-2xl">{description}</p>
    <div className="w-full flex justify-center">
      <div className="aspect-w-16 aspect-h-9 w-full max-w-2xl">
        <iframe
          className="rounded-lg shadow-xl"
          width="100%"
          height="400"
          src={youtubeSrc}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
    {thumbnail && (
      <img src={thumbnail} alt="Vlog thumbnail" className="mt-4 rounded-lg w-96 shadow-md" />
    )}
  </div>
);

export default VlogProject;
