# Sample Speaker Information

Use this data to fill in the speaker details in your admin panel.

## Speaker 1: Dr. Sarah Chen ✅ (Already Complete)
- **Name**: Dr. Sarah Chen
- **Email**: sarah@gmail.com
- **Bio**: A leading AI researcher with over 15 years of experience in machine learning and neural networks.
- **Expertise**: Artificial Intelligence
- **Organization**: Amazon
- **Phone**: +1-555-0101

---

## Speaker 2: Michael Rodriguez
- **Name**: Michael Rodriguez
- **Email**: michael.rodriguez@techcorp.com
- **Bio**: IoT solutions architect specializing in smart city infrastructure and industrial automation. Former CTO at SmartTech Solutions with 12+ years in connected device ecosystems.
- **Expertise**: Internet of Things, Smart Cities
- **Organization**: TechCorp Industries
- **Phone**: +1-555-0102

---

## Speaker 3: Dr. Emily Watson
- **Name**: Dr. Emily Watson
- **Email**: emily.watson@greentech.org
- **Bio**: Environmental technologist and sustainability expert focused on renewable energy systems and eco-friendly manufacturing. PhD in Environmental Engineering from MIT.
- **Expertise**: Green Technology, Renewable Energy
- **Organization**: GreenTech Institute
- **Phone**: +1-555-0103

---

## Speaker 4: Dr. Priya Sharma
- **Name**: Dr. Priya Sharma
- **Email**: priya.sharma@blockchainsec.io
- **Bio**: Blockchain architect and financial technology innovator with expertise in decentralized finance (DeFi) and cryptocurrency security. Previously led blockchain initiatives at major financial institutions.
- **Expertise**: Blockchain, Financial Technology
- **Organization**: BlockchainSec Solutions
- **Phone**: +1-555-0104

---

## Speaker 5: James Anderson
- **Name**: James Anderson
- **Email**: james.anderson@cybersafe.com
- **Bio**: Cybersecurity expert and ethical hacker with 20+ years protecting enterprise systems. CISSP certified and frequent speaker at security conferences worldwide.
- **Expertise**: Cybersecurity, Data Protection
- **Organization**: CyberSafe Consulting
- **Phone**: +1-555-0105

---

## Quick Copy-Paste Format

### Michael Rodriguez
```
Email: michael.rodriguez@techcorp.com
Bio: IoT solutions architect specializing in smart city infrastructure and industrial automation. Former CTO at SmartTech Solutions with 12+ years in connected device ecosystems.
Expertise: Internet of Things, Smart Cities
Organization: TechCorp Industries
Phone: +1-555-0102
```

### Dr. Emily Watson
```
Email: emily.watson@greentech.org
Bio: Environmental technologist and sustainability expert focused on renewable energy systems and eco-friendly manufacturing. PhD in Environmental Engineering from MIT.
Expertise: Green Technology, Renewable Energy
Organization: GreenTech Institute
Phone: +1-555-0103
```

### Dr. Priya Sharma
```
Email: priya.sharma@blockchainsec.io
Bio: Blockchain architect and financial technology innovator with expertise in decentralized finance (DeFi) and cryptocurrency security. Previously led blockchain initiatives at major financial institutions.
Expertise: Blockchain, Financial Technology
Organization: BlockchainSec Solutions
Phone: +1-555-0104
```

### James Anderson
```
Email: james.anderson@cybersafe.com
Bio: Cybersecurity expert and ethical hacker with 20+ years protecting enterprise systems. CISSP certified and frequent speaker at security conferences worldwide.
Expertise: Cybersecurity, Data Protection
Organization: CyberSafe Consulting
Phone: +1-555-0105
```

---

## How to Add This Information

1. Go to **Admin Dashboard** → **Speakers** tab
2. Click the **Edit** button (pencil icon) next to each speaker
3. Fill in the fields with the information above
4. Click **Save**
5. Repeat for all speakers

---

## Alternative: Bulk Import via SQL

If you want to update all speakers at once, run this SQL in your database:

```sql
-- Update Michael Rodriguez
UPDATE speaker 
SET email = 'michael.rodriguez@techcorp.com',
    bio = 'IoT solutions architect specializing in smart city infrastructure and industrial automation. Former CTO at SmartTech Solutions with 12+ years in connected device ecosystems.',
    expertise = 'Internet of Things, Smart Cities',
    organization = 'TechCorp Industries',
    phone = '+1-555-0102'
WHERE LOWER(name) = 'michael rodriguez';

-- Update Dr. Emily Watson
UPDATE speaker 
SET email = 'emily.watson@greentech.org',
    bio = 'Environmental technologist and sustainability expert focused on renewable energy systems and eco-friendly manufacturing. PhD in Environmental Engineering from MIT.',
    expertise = 'Green Technology, Renewable Energy',
    organization = 'GreenTech Institute',
    phone = '+1-555-0103'
WHERE LOWER(name) = 'dr. emily watson' OR LOWER(name) = 'dr emily watson';

-- Update Dr. Priya Sharma
UPDATE speaker 
SET email = 'priya.sharma@blockchainsec.io',
    bio = 'Blockchain architect and financial technology innovator with expertise in decentralized finance (DeFi) and cryptocurrency security. Previously led blockchain initiatives at major financial institutions.',
    expertise = 'Blockchain, Financial Technology',
    organization = 'BlockchainSec Solutions',
    phone = '+1-555-0104'
WHERE LOWER(name) = 'dr. priya sharma' OR LOWER(name) = 'dr priya sharma';

-- Update James Anderson
UPDATE speaker 
SET email = 'james.anderson@cybersafe.com',
    bio = 'Cybersecurity expert and ethical hacker with 20+ years protecting enterprise systems. CISSP certified and frequent speaker at security conferences worldwide.',
    expertise = 'Cybersecurity, Data Protection',
    organization = 'CyberSafe Consulting',
    phone = '+1-555-0105'
WHERE LOWER(name) = 'james anderson';
```

---

## Tips for Writing Speaker Bios

**Good Bio Structure:**
1. **Title/Role** - What they do
2. **Expertise** - Their specialization
3. **Experience** - Years/background
4. **Credentials** - Degrees, certifications, achievements

**Length:** 1-2 sentences (50-100 words)

**Example:**
> "IoT solutions architect specializing in smart city infrastructure and industrial automation. Former CTO at SmartTech Solutions with 12+ years in connected device ecosystems."

---

## Matching Speakers to Conferences

Based on your conference topics, here's the mapping:

| Conference | Speaker |
|------------|---------|
| Internet of Things Connecting the Future | Michael Rodriguez |
| Green Technology and Sustainable Innovation | Dr. Emily Watson |
| Blockchain Revolution in Financial Services | Dr. Priya Sharma |
| Cybersecurity in the Digital Age | James Anderson |
| AI & Machine Learning in Manufacturing | Dr. Sarah Chen |

This ensures each speaker's expertise matches their conference topic! 🎯
