import React from 'react';

const bannerImage = "https://images.unsplash.com/photo-1674027392887-751d6396b710?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

const Banner = () => {
  return (
    <div className="w-full">
      <img src={bannerImage} alt="Banner"
      className="w-full h-20 sm:h-28 md:h-36 lg:h-48 xl:h-62 object-top bg-cover object-cover" />
    </div>
  );
};

export default Banner;