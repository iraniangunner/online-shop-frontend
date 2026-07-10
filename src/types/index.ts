export interface Branch {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  is_active: boolean;
}

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Service {
  id: number;
  service_category_id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  category?: ServiceCategory;
}

export interface Specialist {
  id: number;
  full_name: string;
  phone: string | null;
  bio: string | null;
  avatar: string | null;
  is_active: boolean;
}

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  is_approved: boolean;
}

export interface Appointment {
  id: number;
  code: string;
  status:
    | "pending_payment"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "no_show";
  starts_at: string;
  ends_at: string;
  total_price: number;
  specialist?: Specialist;
  branch?: Branch;
  services?: Service[];
  review?: Review | null;
}