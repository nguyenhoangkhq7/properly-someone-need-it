export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  // Nhóm chính
  { id: "1", name: "Điện thoại", icon: "📱" },
  { id: "2", name: "Laptop", icon: "💻" },
  { id: "3", name: "PC & Linh kiện", icon: "🖥️" },
  { id: "4", name: "Âm thanh", icon: "🎧" },
  { id: "5", name: "Máy ảnh & Quay", icon: "📷" },
  { id: "6", name: "Chơi game", icon: "🎮" },
  { id: "7", name: "Smartwatch", icon: "⌚" },
  { id: "8", name: "Phụ kiện", icon: "🔌" },

  // Nhóm phụ (Dùng làm danh mục con sau này)
  // { id: "2-1", name: "Macbook", icon: "💻" },
  // { id: "2-2", name: "Laptop Windows", icon: "💻" },
  // { id: "3-1", name: "PC (Case)", icon: "🖥️" },
  // { id: "3-2", name: "Màn hình", icon: "⌨️" },
  // { id: "3-3", name: "Linh kiện (RAM, VGA)", icon: "⚙️" },
  // { id:g: "4-1", name: "Tai nghe", icon: "🎧" },
  // { id: "4-2", name: "Loa", icon: "🔊" },
  // { id: "6-1", name: "PlayStation", icon: "🎮" },
  // { id: "6-2", name: "Nintendo", icon: "🎮" },
  // { id: "8-1", name: "Sạc, Cáp", icon: "🔌" },
  // { id: "8-2", name: "Chuột, Bàn phím", icon: "🖱️" },
];
