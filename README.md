# ScaleTools

ScaleTools is an **Amazon Wholesale Supplier Intelligence System** designed for internal operations. It helps manage, clean, and analyze supplier data sourced from Google Sheets.

## 🚀 Features

- **Google Sheets Sync**: Real-time synchronization of supplier data.
- **Data Normalization**: Automated cleaning of URLs, status values, and structured formatting.
- **Supplier Dashboard**: High-performance UI for searching and tracking supplier status.
- **Product Matching Engine**: Intelligence layer to match Amazon ASINs to your supplier database.
- **Profit Calculation**: Risk-adjusted margin and ROI estimation with volatility buffers.
- **Procurement Engine Foundation**: Structural data model and storage for managing the purchase order lifecycle.
- **Operator Command Center**: Global search and command palette (Ctrl+K) for instant access to suppliers and ASINs.
- **Operator Sidebar**: Structured navigation system reflecting the intelligence, data, and control layers.
- **Market Intelligence**: Real-world validation layer analyzing price trends, demand, and competition.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **Validation**: Zod
- **API**: Google Sheets API
- **Icons**: Lucide React

## 📂 Project Structure

```bash
/app
  /dashboard      # Main operator dashboard
  /suppliers      # Detailed supplier management
  /products       # Product matching engine placeholder
  /api            # Internal API routes
/components       # Reusable UI components
/lib              # Core utilities and normalization logic
/services         # Business logic layer
/schemas          # Zod data schemas
/types            # TypeScript type definitions
```

## ⚙️ Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file with:
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-email@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

---
Built as a serious internal operator tool foundation.
