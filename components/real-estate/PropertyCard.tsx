// components/PropertyCard.tsx

import React from 'react';

interface PropertyCardProps {
  imageSrc: string;
  title: string;
  location: string;
  price: string;
  description: string;
  onClick?: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  imageSrc, 
  title, 
  location, 
  price, 
  description, 
  onClick 
}) => {
  return (
    <div 
      className="property-card border rounded shadow-md overflow-hidden cursor-pointer" 
      onClick={onClick}
    >
      <img 
        src={imageSrc} 
        alt={title} 
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-600">{location}</p>
        <p className="text-xl font-bold mt-1">{price}</p>
        <p className="text-gray-800 mt-2">{description}</p>
      </div>
    </div>
  );
};

export default PropertyCard;