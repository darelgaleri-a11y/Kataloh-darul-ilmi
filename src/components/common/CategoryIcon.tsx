import React from 'react';
import {
  BookOpen,
  Shirt,
  Sparkles,
  Coffee,
  Palette,
  Bookmark,
  Package,
  HeartHandshake,
  ShoppingBag,
  Tag,
  Gift,
  Flame,
  Award,
  Layers,
  Leaf
} from 'lucide-react';

interface CategoryIconProps {
  name?: string;
  className?: string;
  size?: number;
}

const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  Shirt,
  Sparkles,
  Coffee,
  Palette,
  Bookmark,
  Package,
  HeartHandshake,
  ShoppingBag,
  Tag,
  Gift,
  Flame,
  Award,
  Layers,
  Leaf
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size }) => {
  const IconComponent = (name && iconMap[name]) || Package;
  return <IconComponent className={className} size={size} />;
};

export const AVAILABLE_ICONS = [
  'Package',
  'BookOpen',
  'Shirt',
  'Sparkles',
  'Coffee',
  'Palette',
  'Bookmark',
  'HeartHandshake',
  'ShoppingBag',
  'Leaf',
  'Gift',
  'Award'
];
