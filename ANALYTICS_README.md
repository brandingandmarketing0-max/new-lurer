# Analytics System Documentation

## Overview

This analytics system tracks visitor data for each profile page, including referrer information, device types, IP addresses, and timestamps. Each page has its own analytics dashboard with detailed insights.

## Features

### 🎯 Page-Specific Analytics
- **Individual tracking**: Each profile page tracks its own visitors
- **Referrer detection**: Automatically detects and categorizes traffic sources (Instagram, Twitter/X, Facebook, TikTok, etc.)
- **Device tracking**: Identifies mobile, tablet, and desktop users
- **IP tracking**: Tracks unique visitors based on IP addresses
- **Timestamp logging**: Records exact visit times

### 📊 Analytics Dashboards
- **Individual page dashboards**: `/page-name/analytics` (e.g., `/brooke/analytics`)
- **Master dashboard**: `/analytics` - Overview of all pages
- **Real-time data**: Refresh button to get latest data
- **Export functionality**: Download CSV files with detailed data

### 🎨 Beautiful UI
- **Modern design**: Clean, professional interface
- **Responsive**: Works on all device sizes
- **Interactive tables**: Sortable and filterable data
- **Visual indicators**: Badges and icons for easy reading

## How It Works

### 1. Data Collection
When a user visits any profile page:
- The `useAnalytics` hook automatically tracks the visit
- Sends data to `/api/store-referrer` endpoint
- Stores data in `analytics/analytics.json` file

### 2. Data Structure
Each analytics entry contains:
```json
{
  "page": "brooke",
  "referrer": "https://instagram.com/...",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "pathname": "/brooke",
  "searchParams": ""
}
```

### 3. Analytics Dashboard Features

#### Summary Cards
- **Total Visitors**: All-time visit count
- **Unique Visitors**: Based on unique IP addresses
- **Top Referrer**: Most common traffic source
- **Most Used Device**: Primary device type

#### Detailed Tables
- **Top Referrers**: Breakdown of traffic sources
- **Device Types**: Mobile/Desktop/Tablet distribution
- **Recent Visits**: Latest visitor activity
- **Raw Data**: Complete analytics dataset

## Usage

### Adding Analytics to a New Page

1. **Add the hook to your page**:
```tsx
"use client";
import { useAnalytics } from "@/hooks/use-analytics";

export default function ProfilePage() {
  useAnalytics("your-page-name");
  
  return (
    // Your page content
  );
}
```

2. **Add analytics dashboard link**:
```tsx
<Link href="/your-page-name/analytics">
  <Button variant="ghost">
    <BarChart3 className="h-4 w-4 mr-2" />
    View Analytics
  </Button>
</Link>
```

3. **Create analytics page**:
```tsx
// app/your-page-name/analytics/page.tsx
import AnalyticsDashboard from "@/components/analytics-dashboard";

export default function YourPageAnalyticsPage() {
  return <AnalyticsDashboard pageName="your-page-name" />;
}
```

### Accessing Analytics

- **Individual page**: Visit `/page-name/analytics`
- **Master dashboard**: Visit `/analytics`
- **Direct links**: Each profile page has a "View Analytics" button

### Data Export

- **Individual page**: Click "Export CSV" on any page dashboard
- **All data**: Click "Export All Data" on master dashboard
- **Format**: CSV files with timestamp, referrer, IP, device type, and user agent

## API Endpoints

### POST `/api/store-referrer`
Stores analytics data for a page visit.

**Request Body**:
```json
{
  "page": "page-name",
  "referrer": "https://instagram.com/...",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "pathname": "/page-name",
  "searchParams": ""
}
```

### GET `/api/analytics`
Retrieves all analytics data.

**Response**:
```json
[
  {
    "page": "brooke",
    "referrer": "https://instagram.com/...",
    "userAgent": "Mozilla/5.0...",
    "ip": "192.168.1.1",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "pathname": "/brooke",
    "searchParams": ""
  }
]
```

## Referrer Detection

The system automatically categorizes common referrers:

- **Instagram**: `instagram.com`
- **Twitter/X**: `twitter.com` or `x.com`
- **Facebook**: `facebook.com`
- **TikTok**: `tiktok.com`
- **LinkedIn**: `linkedin.com`
- **WhatsApp**: `whatsapp.com` or `wa.me`
- **Direct/Unknown**: No referrer or unrecognized source

## Device Detection

Based on User Agent strings:
- **Mobile**: Contains "Mobile" in user agent
- **Tablet**: Contains "Tablet" in user agent
- **Desktop**: Default for all other devices

## File Structure

```
app/
├── api/
│   ├── store-referrer/
│   │   └── route.ts          # Stores analytics data
│   └── analytics/
│       └── route.ts          # Retrieves analytics data
├── page-name/
│   ├── page.tsx              # Profile page with analytics
│   └── analytics/
│       └── page.tsx          # Page-specific dashboard
├── analytics/
│   └── page.tsx              # Master dashboard
components/
├── analytics-dashboard.tsx   # Dashboard component
hooks/
└── use-analytics.ts          # Analytics tracking hook
analytics/
└── analytics.json            # Stored analytics data
```

## Automation Scripts

### `add_analytics_to_pages.ps1`
Automatically adds analytics tracking to all profile pages.

### `create_analytics_pages.ps1`
Creates analytics dashboard pages for all profiles.

## Production Considerations

### Database Storage
For production, replace the JSON file storage with a proper database:

1. **PostgreSQL**: Use a table like:
```sql
CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  page VARCHAR(255) NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip VARCHAR(45),
  timestamp TIMESTAMP DEFAULT NOW(),
  pathname VARCHAR(255),
  search_params TEXT
);
```

2. **MongoDB**: Use a collection like:
```javascript
{
  page: "brooke",
  referrer: "https://instagram.com/...",
  userAgent: "Mozilla/5.0...",
  ip: "192.168.1.1",
  timestamp: new Date(),
  pathname: "/brooke",
  searchParams: ""
}
```

### Privacy Considerations
- **GDPR Compliance**: Consider data retention policies
- **IP Anonymization**: Hash or anonymize IP addresses
- **User Consent**: Add cookie consent if required
- **Data Retention**: Implement automatic data cleanup

### Performance Optimization
- **Caching**: Cache analytics data for faster loading
- **Pagination**: Implement pagination for large datasets
- **Real-time Updates**: Consider WebSocket for live updates
- **CDN**: Serve analytics dashboards via CDN

## Troubleshooting

### Common Issues

1. **Analytics not tracking**:
   - Check if `useAnalytics` hook is imported and called
   - Verify the page name parameter is correct
   - Check browser console for errors

2. **Dashboard not loading**:
   - Ensure analytics API endpoint is working
   - Check if `analytics.json` file exists
   - Verify file permissions

3. **Data not updating**:
   - Click the "Refresh" button
   - Check if new visits are being tracked
   - Verify API endpoint is receiving data

### Debug Mode
Add console logs to track data flow:
```tsx
useAnalytics("page-name", true); // Enable debug mode
```

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify API endpoints are responding
3. Check file permissions for analytics.json
4. Ensure all dependencies are installed

## Future Enhancements

- **Real-time charts**: Live updating graphs
- **Geographic data**: IP-based location tracking
- **Conversion tracking**: Track clicks and conversions
- **A/B testing**: Compare different page versions
- **Email reports**: Automated analytics summaries
- **Advanced filtering**: Date ranges, referrer filtering
- **Heatmaps**: Visual click tracking
- **Session recording**: User behavior analysis 