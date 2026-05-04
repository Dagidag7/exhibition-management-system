# Sample Sponsor Registration Data

Use this data to add new sponsors to your exhibition system.

---

## Existing Sponsors ✅

### 1. INSA
- **Name**: INSA
- **Contact Person**: Abel
- **Email**: abel@gmail.com
- **Contribution Amount**: $10,000
- **Benefits**: N/A

### 2. Africom
- **Name**: Africom
- **Contact Person**: endash
- **Email**: Africom@gmail.com
- **Contribution Amount**: $5,000
- **Benefits**: sdfgh

---

## New Sponsors to Add

### Sponsor 3: TechGlobal Solutions
- **Name**: TechGlobal Solutions
- **Contact Person**: Sarah Mitchell
- **Email**: sarah.mitchell@techglobal.com
- **Contribution Amount**: $25,000
- **Benefits**: Platinum tier: Main stage branding, 10x10 booth space, speaking slot, VIP networking access, logo on all materials

---

### Sponsor 4: Innovation Bank
- **Name**: Innovation Bank
- **Contact Person**: David Chen
- **Email**: david.chen@innovationbank.com
- **Contribution Amount**: $15,000
- **Benefits**: Gold tier: Stage branding, 8x8 booth space, logo on website and programs, VIP lounge access

---

### Sponsor 5: CloudNet Systems
- **Name**: CloudNet Systems
- **Contact Person**: Maria Rodriguez
- **Email**: maria.rodriguez@cloudnet.io
- **Contribution Amount**: $20,000
- **Benefits**: Platinum tier: Premium booth location, keynote sponsorship, digital advertising, networking dinner sponsor

---

### Sponsor 6: GreenEnergy Corp
- **Name**: GreenEnergy Corp
- **Contact Person**: James Wilson
- **Email**: james.wilson@greenenergy.com
- **Contribution Amount**: $12,000
- **Benefits**: Gold tier: Exhibition booth, logo placement, conference bag insert, social media mentions

---

### Sponsor 7: DataSecure Inc
- **Name**: DataSecure Inc
- **Contact Person**: Lisa Thompson
- **Email**: lisa.thompson@datasecure.com
- **Contribution Amount**: $8,000
- **Benefits**: Silver tier: Standard booth space, logo on website, attendee list access, 2 conference passes

---

### Sponsor 8: SmartCity Technologies
- **Name**: SmartCity Technologies
- **Contact Person**: Ahmed Hassan
- **Email**: ahmed.hassan@smartcity.tech
- **Contribution Amount**: $30,000
- **Benefits**: Diamond tier: Title sponsorship, largest booth space, keynote presentation, exclusive branding, VIP dinner hosting

---

### Sponsor 9: FinTech Innovations
- **Name**: FinTech Innovations
- **Contact Person**: Emily Parker
- **Email**: emily.parker@fintechinnovations.com
- **Contribution Amount**: $10,000
- **Benefits**: Gold tier: Booth space, workshop sponsorship, logo on badges, networking reception sponsor

---

### Sponsor 10: AI Research Labs
- **Name**: AI Research Labs
- **Contact Person**: Dr. Robert Kim
- **Email**: robert.kim@airesearch.org
- **Contribution Amount**: $18,000
- **Benefits**: Platinum tier: Innovation zone sponsor, demo area, speaking opportunity, premium booth location

---

## Quick Copy-Paste Format

### TechGlobal Solutions
```
Name: TechGlobal Solutions
Contact Person: Sarah Mitchell
Email: sarah.mitchell@techglobal.com
Contribution Amount: 25000
Benefits: Platinum tier: Main stage branding, 10x10 booth space, speaking slot, VIP networking access, logo on all materials
```

### Innovation Bank
```
Name: Innovation Bank
Contact Person: David Chen
Email: david.chen@innovationbank.com
Contribution Amount: 15000
Benefits: Gold tier: Stage branding, 8x8 booth space, logo on website and programs, VIP lounge access
```

### CloudNet Systems
```
Name: CloudNet Systems
Contact Person: Maria Rodriguez
Email: maria.rodriguez@cloudnet.io
Contribution Amount: 20000
Benefits: Platinum tier: Premium booth location, keynote sponsorship, digital advertising, networking dinner sponsor
```

### GreenEnergy Corp
```
Name: GreenEnergy Corp
Contact Person: James Wilson
Email: james.wilson@greenenergy.com
Contribution Amount: 12000
Benefits: Gold tier: Exhibition booth, logo placement, conference bag insert, social media mentions
```

### DataSecure Inc
```
Name: DataSecure Inc
Contact Person: Lisa Thompson
Email: lisa.thompson@datasecure.com
Contribution Amount: 8000
Benefits: Silver tier: Standard booth space, logo on website, attendee list access, 2 conference passes
```

### SmartCity Technologies
```
Name: SmartCity Technologies
Contact Person: Ahmed Hassan
Email: ahmed.hassan@smartcity.tech
Contribution Amount: 30000
Benefits: Diamond tier: Title sponsorship, largest booth space, keynote presentation, exclusive branding, VIP dinner hosting
```

### FinTech Innovations
```
Name: FinTech Innovations
Contact Person: Emily Parker
Email: emily.parker@fintechinnovations.com
Contribution Amount: 10000
Benefits: Gold tier: Booth space, workshop sponsorship, logo on badges, networking reception sponsor
```

### AI Research Labs
```
Name: AI Research Labs
Contact Person: Dr. Robert Kim
Email: robert.kim@airesearch.org
Contribution Amount: 18000
Benefits: Platinum tier: Innovation zone sponsor, demo area, speaking opportunity, premium booth location
```

---

## Sponsorship Tiers

### Diamond Tier ($25,000+)
- Title sponsorship
- Largest booth space (12x12 or larger)
- Keynote presentation slot
- Exclusive branding on main stage
- VIP dinner hosting
- All lower tier benefits

### Platinum Tier ($15,000 - $24,999)
- Premium booth location (10x10)
- Speaking opportunity
- Main stage branding
- VIP networking access
- Logo on all materials
- Digital advertising

### Gold Tier ($10,000 - $14,999)
- Exhibition booth (8x8)
- Logo on website and programs
- Workshop/session sponsorship
- VIP lounge access
- Social media mentions

### Silver Tier ($5,000 - $9,999)
- Standard booth space (6x6)
- Logo on website
- Attendee list access
- Conference passes (2-4)
- Conference bag insert

### Bronze Tier ($1,000 - $4,999)
- Logo on website
- Conference passes (1-2)
- Social media mention
- Attendee list access

---

## How to Add Sponsors

### Via Admin Panel:
1. Go to **Admin Dashboard** → **Sponsors** tab
2. Click **"+ Add Sponsor"** button
3. Fill in the form with the information above
4. Click **Save**
5. Repeat for each sponsor

### Via SQL (Bulk Import):
```sql
-- Insert TechGlobal Solutions
INSERT INTO sponsor (name, contact_person, email, contribution_amount, benefits, status)
VALUES ('TechGlobal Solutions', 'Sarah Mitchell', 'sarah.mitchell@techglobal.com', 25000, 
'Platinum tier: Main stage branding, 10x10 booth space, speaking slot, VIP networking access, logo on all materials', 'active');

-- Insert Innovation Bank
INSERT INTO sponsor (name, contact_person, email, contribution_amount, benefits, status)
VALUES ('Innovation Bank', 'David Chen', 'david.chen@innovationbank.com', 15000,
'Gold tier: Stage branding, 8x8 booth space, logo on website and programs, VIP lounge access', 'active');

-- Insert CloudNet Systems
INSERT INTO sponsor (name, contact_person, email, contribution_amount, benefits, status)
VALUES ('CloudNet Systems', 'Maria Rodriguez', 'maria.rodriguez@cloudnet.io', 20000,
'Platinum tier: Premium booth location, keynote sponsorship, digital advertising, networking dinner sponsor', 'active');

-- Insert GreenEnergy Corp
INSERT INTO sponsor (name, contact_person, email, contribution_amount, benefits, status)
VALUES ('GreenEnergy Corp', 'James Wilson', 'james.wilson@greenenergy.com', 12000,
'Gold tier: Exhibition booth, logo placement, conference bag insert, social media mentions', 'active');

-- Insert DataSecure Inc
INSERT INTO sponsor (name, contact_person, email, contribution_amount, benefits, status)
VALUES ('DataSecure Inc', 'Lisa Thompson', 'lisa.thompson@datasecure.com', 8000,
'Silver tier: Standard booth space, logo on website, attendee list access, 2 conference passes', 'active');

-- Insert SmartCity Technologies
INSERT INTO sponsor (name, contact_person, email, contribution_amount, benefits, status)
VALUES ('SmartCity Technologies', 'Ahmed Hassan', 'ahmed.hassan@smartcity.tech', 30000,
'Diamond tier: Title sponsorship, largest booth space, keynote presentation, exclusive branding, VIP dinner hosting', 'active');

-- Insert FinTech Innovations
INSERT INTO sponsor (name, contact_person, email, contribution_amount, benefits, status)
VALUES ('FinTech Innovations', 'Emily Parker', 'emily.parker@fintechinnovations.com', 10000,
'Gold tier: Booth space, workshop sponsorship, logo on badges, networking reception sponsor', 'active');

-- Insert AI Research Labs
INSERT INTO sponsor (name, contact_person, email, contribution_amount, benefits, status)
VALUES ('AI Research Labs', 'Dr. Robert Kim', 'robert.kim@airesearch.org', 18000,
'Platinum tier: Innovation zone sponsor, demo area, speaking opportunity, premium booth location', 'active');
```

---

## Total Sponsorship Revenue

| Tier | Count | Total Amount |
|------|-------|--------------|
| Existing | 2 | $15,000 |
| Diamond | 1 | $30,000 |
| Platinum | 3 | $63,000 |
| Gold | 3 | $37,000 |
| Silver | 1 | $8,000 |
| **TOTAL** | **10** | **$153,000** |

---

## Tips for Managing Sponsors

1. **Upload Logos**: After adding sponsors, upload their company logos
2. **Send Payment Links**: Use the "Request Payment" button to send Stripe payment links
3. **Track Status**: Monitor payment status and fulfillment of benefits
4. **Communication**: Keep sponsors updated on event details and their benefits
5. **Recognition**: Ensure sponsor logos appear on website, materials, and signage

---

## Logo Upload Recommendations

- **Format**: PNG with transparent background (preferred) or JPG
- **Size**: Minimum 500x500 pixels, maximum 2000x2000 pixels
- **Aspect Ratio**: Square or horizontal (2:1 ratio)
- **File Size**: Under 2MB
- **Quality**: High resolution for print materials

---

## Next Steps After Adding Sponsors

1. ✅ Add sponsor information
2. 📤 Upload sponsor logos
3. 💳 Send payment request links
4. 📧 Send welcome email with benefits details
5. 🎨 Add logos to website and marketing materials
6. 📊 Track payment status
7. 🤝 Schedule sponsor onboarding calls
8. 📍 Assign booth locations
9. 📅 Confirm speaking slots (if applicable)
10. 🎉 Recognize sponsors on social media
