# Customer Reviews Homepage Feature - Requirements Document

## Overview
Add a prominent "What Our Customers Say" section to the Home page to showcase customer testimonials and increase trust and conversion rates for the My Green Loop rental service.

## Business Objectives
- **Increase Trust**: Display authentic customer experiences to build credibility
- **Improve Conversion**: Showcase positive feedback to encourage bookings
- **Highlight Value**: Demonstrate real customer satisfaction and eco-friendly impact
- **Drive Traffic**: Create pathway to dedicated Reviews page

## User Stories

### As a potential customer visiting the homepage:
- I want to see what other customers say about the service
- I want to quickly understand if this rental service is reliable
- I want to see real examples of successful events
- I want to easily access more detailed reviews

### As a returning customer:
- I want to see if my review is featured
- I want to see how the service has helped other customers

## Technical Requirements

### 1. Data Source
- **Primary**: Fetch from existing `/api/feedback/public` endpoint
- **Fallback**: Display appropriate message if no reviews are available
- **Filtering**: Only show reviews marked as `isVisible: true` by admin

### 2. Review Selection Logic
- **Quantity**: Display 3 most recent approved reviews
- **Prioritization**: 
  1. 5-star reviews first
  2. Reviews with customer photos
  3. Reviews with detailed comments
  4. Most recent reviews
- **Diversity**: Attempt to show different cities and event types

### 3. Component Structure
```
HomeCustomerReviews/
├── ReviewCard (reusable component)
├── StarRating (reusable component)
├── EventTag (reusable component)
└── ViewAllButton (navigation component)
```

### 4. Data Requirements
Each review card must display:
- **Customer Information**: Name (first name + last initial), City
- **Rating**: Visual star rating (1-5 stars)
- **Review Text**: Customer quote/testimonial
- **Event Context**: Event type and quantity tags
- **Avatar**: Customer photo (if available) or default avatar

### 5. Layout Specifications
- **Position**: Between "How It Works" and "FAQ" sections
- **Responsive Design**: 
  - Mobile: 1 column (stacked cards)
  - Tablet: 2 columns
  - Desktop: 3 columns
- **Card Styling**: White background with subtle shadow
- **Spacing**: Consistent with existing page sections

## Visual Design Requirements

### 1. Section Header
- **Title**: "What Our Customers Say"
- **Typography**: `text-3xl font-bold text-green-800` (matching existing headers)
- **Alignment**: Center-aligned

### 2. Review Cards
- **Card Design**: 
  - White background (`bg-white`)
  - Subtle shadow (`shadow-lg`)
  - Rounded corners (consistent with site theme)
  - Padding: `pt-6` for content

### 3. Customer Profile
- **Avatar**: 
  - 48x48px circular image
  - Fallback to default profile icon if no photo
  - Professional, friendly appearance
- **Name**: Bold, prominent display
- **Location**: Smaller, muted text

### 4. Star Rating
- **Visual**: Filled/unfilled star icons
- **Color**: Yellow stars (`fill-yellow-400 text-yellow-400`)
- **Text**: Numerical rating display `(X/5)`
- **Size**: 16px star icons

### 5. Event Tags
- **Style**: Small rounded badges
- **Colors**: 
  - Event type: Green (`bg-green-100 text-green-800`)
  - Quantity: Blue (`bg-blue-100 text-blue-800`)
  - Special events: Purple (`bg-purple-100 text-purple-800`)

### 6. Call-to-Action
- **Button**: "View All Reviews"
- **Style**: Outline button with green theme
- **Link**: Navigate to `/reviews` page

## Data Processing Requirements

### 1. Review Text Processing
- **Length**: Limit to 120 characters, truncate with "..." if longer
- **Sanitization**: Remove HTML tags, ensure clean text display
- **Fallback**: Use structured testimonial if no review text available

### 2. Event Type Detection
- **Source**: Derive from rental date, customer name, or review content
- **Categories**: Family Event, Birthday, Graduation, Wedding, Corporate, etc.
- **Quantity Display**: Show total items rented (plates + glasses + cutlery)

### 3. Image Handling
- **Customer Photos**: Use uploaded customer images if available
- **Default Avatars**: Professional stock photos as fallbacks
- **Optimization**: Ensure images are optimized for web display

## Performance Requirements

### 1. Loading
- **Initial Load**: Reviews should load within 2 seconds
- **Fallback**: Show loading skeleton while data fetches
- **Error Handling**: Graceful fallback if API fails

### 2. Caching
- **Browser Cache**: Cache review data for 5 minutes
- **Image Cache**: Cache customer photos appropriately
- **Update Frequency**: Refresh when new reviews are approved

## Content Requirements

### 1. Review Content
- **Authenticity**: All reviews must be from actual customers
- **Diversity**: Show variety of event types and customer demographics
- **Quality**: Prioritize meaningful, detailed reviews

### 2. Fallback Content
- **No Reviews**: Display message encouraging customers to leave feedback
- **Insufficient Reviews**: Show available reviews with placeholder cards
- **Loading State**: Professional loading animation

## Implementation Approach

### 1. Phase 1: Core Component
- Create reusable ReviewCard component
- Implement star rating system
- Add basic responsive layout

### 2. Phase 2: Data Integration
- Connect to existing feedback API
- Implement review selection logic
- Add loading and error states

### 3. Phase 3: Enhancement
- Add event type detection
- Implement image handling
- Add animation/transitions

### 4. Phase 4: Optimization
- Performance optimization
- SEO improvements
- Analytics tracking

## Testing Requirements

### 1. Functional Testing
- Verify correct data fetching from API
- Test responsive design across devices
- Validate star rating display
- Test navigation to Reviews page

### 2. Visual Testing
- Ensure consistent styling with site theme
- Test image loading and fallbacks
- Verify proper text truncation
- Test card layout and spacing

### 3. Performance Testing
- Measure loading times
- Test with various data volumes
- Verify caching behavior

## Success Metrics

### 1. Engagement Metrics
- **Click-through Rate**: Percentage of users clicking "View All Reviews"
- **Time on Page**: Increased time spent on homepage
- **Scroll Depth**: Users scrolling to reviews section

### 2. Conversion Metrics
- **Booking Rate**: Increase in rental bookings from homepage
- **User Journey**: Progression from reviews to catalog to checkout

### 3. User Feedback
- **Review Submissions**: Increase in customer feedback submissions
- **Quality Ratings**: Positive feedback about review display

## Maintenance Requirements

### 1. Content Management
- **Review Moderation**: Admin can approve/hide reviews
- **Content Updates**: Easy to update featured reviews
- **Quality Control**: Monitor review quality and authenticity

### 2. Technical Maintenance
- **API Monitoring**: Monitor feedback API performance
- **Error Logging**: Track and resolve display issues
- **Performance Monitoring**: Regular performance assessments

## Risk Assessment

### 1. Technical Risks
- **API Dependency**: Failure of feedback API could break section
- **Image Loading**: Slow or failed image loading could impact UX
- **Data Quality**: Poor review content could harm credibility

### 2. Mitigation Strategies
- **Graceful Degradation**: Show fallback content if API fails
- **Image Optimization**: Implement proper image loading and fallbacks
- **Content Curation**: Maintain high standards for featured reviews

## Approval Criteria

### 1. Technical Acceptance
- [ ] Component renders correctly on all screen sizes
- [ ] Data fetches successfully from existing API
- [ ] Loading states and error handling work properly
- [ ] Navigation to Reviews page functions correctly

### 2. Design Acceptance
- [ ] Visual design matches site theme and branding
- [ ] Typography and spacing are consistent
- [ ] Star ratings display correctly
- [ ] Event tags are visually appealing and informative

### 3. Content Acceptance
- [ ] Reviews display authentic customer feedback
- [ ] Customer information is properly formatted
- [ ] Event context is clear and informative
- [ ] Call-to-action is prominent and effective

## Timeline Estimate
- **Planning & Setup**: 0.5 hours
- **Component Development**: 1.5 hours
- **Data Integration**: 1 hour
- **Testing & Refinement**: 1 hour
- **Total**: 4 hours

## Dependencies
- Existing feedback system and API
- Customer review data in database
- Current homepage layout and styling
- Reviews page functionality

---

*Document Version: 1.0*  
*Created: July 11, 2025*  
*Project: My Green Loop - Customer Reviews Homepage Feature*