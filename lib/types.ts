// Tipos do banco de dados

export interface Profile {
  id: string;
  name: string;
  phone: string;
  role: "owner" | "renter";
  created_at: string;
}

export interface Car {
  id: string;
  owner_id: string;
  title: string;
  city: string;
  price_per_day: number;
  description: string;
  active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  car_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  status: "pending" | "approved" | "rejected";
  paid: boolean;
  created_at: string;
  // Campos joined (opcionais)
  car?: Car;
  renter?: Profile;
}
