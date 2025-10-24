export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: "1", name: "Sách", icon: "📚" },
  { id: "2", name: "Điện tử", icon: "📱" },
  { id: "3", name: "Thời trang", icon: "👕" },
  { id: "4", name: "Đồ gia dụng", icon: "🏠" },
  { id: "5", name: "Thể thao", icon: "⚽" },
];
