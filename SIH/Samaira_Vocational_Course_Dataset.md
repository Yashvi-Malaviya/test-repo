# Samaira --- Vocational Career Knowledge Dataset

## Prototype Dataset for AI-Enabled Career Counselling

> **Purpose:** This dataset is designed for the Samaira counselling
> prototype described in SIH Problem Statement 26241.
>
> **Important:** Placement rates, salary ranges, and provider-level
> outcomes in this prototype are **synthetic/demo values** intended for
> UI, AI-flow, and hackathon development. They must be replaced or
> reconciled with the official/dummy dataset supplied by the hackathon
> before being presented as real-world verified statistics.

------------------------------------------------------------------------

# 1. Dataset Scope

The prototype contains **8 representative vocational trades** covering
major employment-oriented sectors.

  ------------------------------------------------------------------------------
  ID            Sector          Trade / Course Typical Entry        Example NSQF
                                               Education                 Level\*
  ------------- --------------- -------------- --------------- -----------------
  VOC001        Electrical      Electrician    10th pass                       4

  VOC002        Renewable       Solar PV       10th pass                       4
                Energy          Installer /                    
                                Technician                     

  VOC003        Manufacturing   CNC Operator   10th pass                       4

  VOC004        Automotive      Automotive     10th pass                       4
                                Service                        
                                Technician                     

  VOC005        Healthcare      General Duty   10th / 12th                     4
                                Assistant      depending on    
                                               qualification   

  VOC006        IT & Digital    Domestic Data  10th / 12th                     4
                                Entry Operator                 

  VOC007        Construction    Assistant      10th pass                    3--4
                                Electrician /                  
                                Construction                   
                                Electrician                    

  VOC008        Retail &        Retail Sales   10th / 12th                  3--4
                Logistics       Associate                      
  ------------------------------------------------------------------------------

\*NSQF levels shown here are **prototype reference values** and should
be validated against the exact qualification/occupation record used in
the final dataset.

------------------------------------------------------------------------

# 2. Master Course Dataset

## VOC001 --- Electrician

  -----------------------------------------------------------------------
  Field                               Value
  ----------------------------------- -----------------------------------
  course_id                           VOC001

  sector                              Electrical

  trade_name                          Electrician

  aliases                             Electrical Technician, Wireman,
                                      Maintenance Electrician

  entry_education                     10th pass

  typical_duration                    1--2 years depending on
                                      qualification/program

  example_nsqf_level                  4

  work_environment                    Residential buildings, commercial
                                      buildings, factories, workshops,
                                      infrastructure sites

  practical_work                      Wiring, installation, maintenance,
                                      fault finding, electrical equipment
                                      handling

  major_skills                        Electrical wiring, testing, safety
                                      procedures, tools, troubleshooting

  common_job_roles                    Electrician, Maintenance
                                      Electrician, Electrical Technician

  industries                          Construction, Manufacturing,
                                      Facilities Management,
                                      Infrastructure, Solar

  career_growth                       Electrician → Skilled Electrician →
                                      Senior Technician → Supervisor →
                                      Maintenance/Technical Supervisor

  further_learning                    Advanced electrical certifications,
                                      higher NSQF qualifications,
                                      diploma/technical education where
                                      eligible

  parent_concerns                     Income, safety, job stability,
                                      career growth, social perception

  demo_starting_earnings_monthly      ₹14,000--₹18,000

  demo_experienced_earnings_monthly   ₹25,000--₹35,000

  demo_placement_rate                 76%

  data_status                         SYNTHETIC DEMO

  evidence_required                   Official qualification + verified
                                      placement/earnings dataset
  -----------------------------------------------------------------------

### What Samaira can explain

-   Electricians are required in homes, commercial buildings, factories,
    infrastructure projects and maintenance operations.
-   The occupation can lead to supervisory and specialised technical
    roles.
-   Safety training and correct protective equipment are important parts
    of electrical work.
-   Solar and industrial electrical work can provide additional
    specialisation routes.

------------------------------------------------------------------------

## VOC002 --- Solar PV Installer / Technician

  -----------------------------------------------------------------------
  Field                               Value
  ----------------------------------- -----------------------------------
  course_id                           VOC002

  sector                              Renewable Energy

  trade_name                          Solar PV Installer / Technician

  aliases                             Solar Technician, Solar Installer,
                                      Solar PV Service Technician

  entry_education                     10th pass

  typical_duration                    3--12 months depending on
                                      qualification

  example_nsqf_level                  4

  work_environment                    Rooftops, solar farms, commercial
                                      buildings, residential sites,
                                      renewable-energy companies

  practical_work                      Panel installation, mounting,
                                      wiring, inspection, basic
                                      maintenance

  major_skills                        Solar PV installation, electrical
                                      basics, safety, tools,
                                      troubleshooting

  common_job_roles                    Solar Installer, Solar Technician,
                                      Solar Service Technician

  industries                          Renewable Energy, Electrical
                                      Services, Construction,
                                      Infrastructure

  career_growth                       Solar Technician → Senior
                                      Technician → Site Supervisor →
                                      Solar Project/Operations roles

  further_learning                    Advanced solar certifications,
                                      electrical qualifications, higher
                                      technical education

  parent_concerns                     Job availability, outdoor work,
                                      safety, income, long-term growth

  demo_starting_earnings_monthly      ₹14,000--₹20,000

  demo_experienced_earnings_monthly   ₹25,000--₹40,000

  demo_placement_rate                 78%

  data_status                         SYNTHETIC DEMO

  evidence_required                   Official renewable-energy
                                      qualification + outcome dataset
  -----------------------------------------------------------------------

### What Samaira can explain

-   Solar work combines electrical skills with renewable-energy
    applications.
-   Work may involve outdoor and rooftop environments.
-   The career can progress from installation to supervision and
    specialised solar operations.
-   Electrical safety and working-at-height safety are important.

------------------------------------------------------------------------

## VOC003 --- CNC Operator

  -----------------------------------------------------------------------
  Field                               Value
  ----------------------------------- -----------------------------------
  course_id                           VOC003

  sector                              Manufacturing

  trade_name                          CNC Operator

  aliases                             CNC Machine Operator, CNC Turning
                                      Operator, CNC Machining Operator

  entry_education                     10th pass

  typical_duration                    3--12 months depending on program

  example_nsqf_level                  4

  work_environment                    Manufacturing plants, machine
                                      shops, automotive factories,
                                      engineering industries

  practical_work                      Machine setup, operation,
                                      measurement, quality checking,
                                      basic troubleshooting

  major_skills                        CNC operation, measurement,
                                      machining basics, safety, quality
                                      control

  common_job_roles                    CNC Operator, Machine Operator,
                                      Production Technician

  industries                          Automotive, Engineering,
                                      Manufacturing, Aerospace
                                      components, Industrial production

  career_growth                       CNC Operator → Skilled Operator →
                                      CNC Programmer/Setup Technician →
                                      Supervisor

  further_learning                    CNC programming, CAD/CAM, advanced
                                      machining, diploma/technical
                                      education

  parent_concerns                     Salary, factory environment, career
                                      growth, job stability

  demo_starting_earnings_monthly      ₹15,000--₹21,000

  demo_experienced_earnings_monthly   ₹28,000--₹45,000

  demo_placement_rate                 82%

  data_status                         SYNTHETIC DEMO

  evidence_required                   Official manufacturing
                                      qualification + outcome dataset
  -----------------------------------------------------------------------

### What Samaira can explain

-   CNC operators work with computer-controlled manufacturing equipment.
-   The career can progress into setup, programming, quality and
    supervisory roles.
-   Precision, measurement and machine safety are important.
-   Additional CAD/CAM and CNC programming skills can improve
    progression opportunities.

------------------------------------------------------------------------

## VOC004 --- Automotive Service Technician

  -----------------------------------------------------------------------
  Field                               Value
  ----------------------------------- -----------------------------------
  course_id                           VOC004

  sector                              Automotive

  trade_name                          Automotive Service Technician

  aliases                             Automobile Technician, Vehicle
                                      Service Technician, Auto Service
                                      Technician

  entry_education                     10th pass

  typical_duration                    1--2 years depending on program

  example_nsqf_level                  4

  work_environment                    Service centres, dealerships,
                                      workshops, fleet maintenance
                                      facilities

  practical_work                      Vehicle inspection, servicing,
                                      diagnostics, repair and maintenance

  major_skills                        Mechanical systems, diagnostics,
                                      tools, vehicle maintenance, safety

  common_job_roles                    Automotive Technician, Service
                                      Technician, Diagnostic Technician

  industries                          Automotive, Transport, Fleet
                                      Management, Service Centres

  career_growth                       Technician → Senior Technician →
                                      Diagnostic Specialist → Service
                                      Advisor/Supervisor

  further_learning                    EV maintenance, diagnostics,
                                      advanced automotive certifications,
                                      diploma/technical education

  parent_concerns                     Income, workshop safety, future of
                                      petrol/diesel vehicles, career
                                      stability

  demo_starting_earnings_monthly      ₹14,000--₹20,000

  demo_experienced_earnings_monthly   ₹25,000--₹40,000

  demo_placement_rate                 75%

  data_status                         SYNTHETIC DEMO

  evidence_required                   Official automotive qualification +
                                      outcome dataset
  -----------------------------------------------------------------------

### What Samaira can explain

-   Automotive technicians work in service centres, workshops and fleet
    operations.
-   EV servicing and vehicle diagnostics can provide newer
    specialisation paths.
-   Career progression is possible through advanced diagnostics, service
    management and specialisation.
-   Safety and correct workshop practices are essential.

------------------------------------------------------------------------

## VOC005 --- General Duty Assistant

  -----------------------------------------------------------------------
  Field                               Value
  ----------------------------------- -----------------------------------
  course_id                           VOC005

  sector                              Healthcare

  trade_name                          General Duty Assistant

  aliases                             Healthcare Assistant, Patient Care
                                      Assistant, Nursing Assistant-type
                                      roles depending on qualification

  entry_education                     Usually 10th/12th depending on
                                      qualification

  typical_duration                    3--12 months depending on
                                      qualification

  example_nsqf_level                  4

  work_environment                    Hospitals, clinics, elderly-care
                                      facilities, healthcare centres

  practical_work                      Basic patient support, hygiene
                                      assistance, mobility support,
                                      non-clinical care activities

  major_skills                        Patient care, communication,
                                      hygiene, basic safety, empathy

  common_job_roles                    General Duty Assistant, Patient
                                      Care Assistant, Healthcare Support
                                      Worker

  industries                          Hospitals, Clinics, Elder Care,
                                      Home Healthcare

  career_growth                       Assistant → Experienced Care Worker
                                      → Senior Support Role → Further
                                      healthcare education where eligible

  further_learning                    Higher-level healthcare support
                                      qualifications and eligible formal
                                      education

  parent_concerns                     Job security, emotional workload,
                                      safety, social perception, income

  demo_starting_earnings_monthly      ₹13,000--₹19,000

  demo_experienced_earnings_monthly   ₹22,000--₹32,000

  demo_placement_rate                 80%

  data_status                         SYNTHETIC DEMO

  evidence_required                   Official healthcare qualification +
                                      outcome dataset
  -----------------------------------------------------------------------

### What Samaira can explain

-   Healthcare support roles contribute directly to patient care.
-   The work requires empathy, discipline, communication and adherence
    to safety procedures.
-   Healthcare services can provide employment across hospitals and care
    settings.
-   The exact scope of duties depends on the qualification and employer.

------------------------------------------------------------------------

## VOC006 --- Domestic Data Entry Operator

  -----------------------------------------------------------------------
  Field                               Value
  ----------------------------------- -----------------------------------
  course_id                           VOC006

  sector                              IT & Digital

  trade_name                          Domestic Data Entry Operator

  aliases                             Data Entry Operator, Digital Data
                                      Entry Assistant

  entry_education                     10th/12th depending on
                                      qualification

  typical_duration                    3--6 months depending on program

  example_nsqf_level                  4

  work_environment                    Offices, service centres, BPO/KPO
                                      environments, organisations with
                                      digital records

  practical_work                      Data entry, document processing,
                                      spreadsheet work, digital record
                                      management

  major_skills                        Typing, spreadsheets, digital
                                      tools, accuracy, communication

  common_job_roles                    Data Entry Operator, Data
                                      Processing Assistant, Documentation
                                      Assistant

  industries                          IT-enabled Services, Offices,
                                      Government/Administrative Services,
                                      BPO

  career_growth                       Data Entry Operator → Senior
                                      Data/Documentation Assistant →
                                      Process Executive → Operations
                                      roles

  further_learning                    Advanced spreadsheets, digital
                                      tools, data analytics, office
                                      automation, IT qualifications

  parent_concerns                     Job security, automation, salary,
                                      career growth

  demo_starting_earnings_monthly      ₹13,000--₹19,000

  demo_experienced_earnings_monthly   ₹22,000--₹32,000

  demo_placement_rate                 72%

  data_status                         SYNTHETIC DEMO

  evidence_required                   Official qualification + current
                                      employment outcome data
  -----------------------------------------------------------------------

### What Samaira can explain

-   Data-entry work requires accuracy and digital literacy.
-   Digital skills can be used as a foundation for progressing toward
    more advanced office, data or IT roles.
-   The impact of automation should be discussed honestly rather than
    promising permanent job security.
-   Additional digital skills can improve long-term career options.

------------------------------------------------------------------------

## VOC007 --- Assistant Electrician / Construction Electrician

  -----------------------------------------------------------------------
  Field                               Value
  ----------------------------------- -----------------------------------
  course_id                           VOC007

  sector                              Construction

  trade_name                          Assistant Electrician /
                                      Construction Electrician

  aliases                             Construction Electrical Helper,
                                      Electrical Installation Assistant

  entry_education                     10th pass

  typical_duration                    3--12 months depending on
                                      qualification

  example_nsqf_level                  3--4

  work_environment                    Construction sites, residential
                                      projects, commercial projects,
                                      infrastructure projects

  practical_work                      Cable handling, electrical
                                      installation assistance, tools,
                                      basic testing, site support

  major_skills                        Electrical basics, tools, workplace
                                      safety, installation support

  common_job_roles                    Assistant Electrician, Electrical
                                      Helper, Construction Electrician

  industries                          Construction, Infrastructure,
                                      Building Services

  career_growth                       Assistant Electrician → Electrician
                                      → Senior Electrician → Site
                                      Supervisor

  further_learning                    Electrician qualification, advanced
                                      electrical skills, solar/industrial
                                      specialisation

  parent_concerns                     Safety, physical work, income, job
                                      stability, career progression

  demo_starting_earnings_monthly      ₹12,000--₹17,000

  demo_experienced_earnings_monthly   ₹23,000--₹34,000

  demo_placement_rate                 74%

  data_status                         SYNTHETIC DEMO

  evidence_required                   Official construction/electrical
                                      qualification + outcome dataset
  -----------------------------------------------------------------------

### What Samaira can explain

-   This can be an entry point into the electrical profession.
-   Experience and additional qualifications can allow progression to
    skilled electrician and supervisory roles.
-   Construction work can be physically demanding and requires strong
    safety practices.
-   Specialisation in electrical maintenance or solar can provide
    additional pathways.

------------------------------------------------------------------------

## VOC008 --- Retail Sales Associate

  -----------------------------------------------------------------------
  Field                               Value
  ----------------------------------- -----------------------------------
  course_id                           VOC008

  sector                              Retail & Customer Service

  trade_name                          Retail Sales Associate

  aliases                             Retail Associate, Sales Associate,
                                      Store Associate

  entry_education                     10th/12th depending on
                                      qualification

  typical_duration                    3--6 months depending on program

  example_nsqf_level                  3--4

  work_environment                    Retail stores, shopping centres,
                                      supermarkets, electronics stores,
                                      consumer businesses

  practical_work                      Customer assistance, product
                                      information, billing support, stock
                                      handling, sales

  major_skills                        Communication, customer service,
                                      sales, product knowledge, basic
                                      digital tools

  common_job_roles                    Retail Sales Associate, Store
                                      Associate, Customer Service
                                      Associate

  industries                          Retail, Consumer Electronics, FMCG,
                                      E-commerce support

  career_growth                       Sales Associate → Senior Associate
                                      → Team Leader → Store
                                      Supervisor/Manager

  further_learning                    Sales management, digital retail,
                                      customer experience,
                                      business/management education

  parent_concerns                     Salary, social perception, working
                                      hours, career growth

  demo_starting_earnings_monthly      ₹12,000--₹18,000

  demo_experienced_earnings_monthly   ₹22,000--₹35,000

  demo_placement_rate                 73%

  data_status                         SYNTHETIC DEMO

  evidence_required                   Official retail qualification +
                                      outcome dataset
  -----------------------------------------------------------------------

### What Samaira can explain

-   Retail roles develop communication, sales and customer-management
    skills.
-   Progression can lead to team-lead and store-management positions.
-   Working hours may vary depending on the employer.
-   Digital retail and e-commerce are additional areas for skill
    development.

------------------------------------------------------------------------

# 3. Standard Career Pathway Dataset

Use this table when Samaira needs to visually explain **"Where can my
child go after this course?"**

  --------------------------------------------------------------------------------
  Course ID      Entry Role     Intermediate   Advanced Role  Possible Further
                                Role                          Direction
  -------------- -------------- -------------- -------------- --------------------
  VOC001         Electrician    Senior         Supervisor     Industrial, solar,
                                Electrician /                 maintenance
                                Technician                    specialisation

  VOC002         Solar          Senior Solar   Site           Solar
                 Technician     Technician     Supervisor     operations/project
                                                              roles

  VOC003         CNC Operator   Skilled        CNC Programmer CAD/CAM, advanced
                                Operator /     / Supervisor   manufacturing
                                Setup                         
                                Technician                    

  VOC004         Automotive     Senior         Diagnostic     EV, diagnostics,
                 Technician     Technician     Specialist /   service management
                                               Supervisor     

  VOC005         General Duty   Experienced    Senior Support Higher healthcare
                 Assistant      Care Worker    Role           qualifications

  VOC006         Data Entry     Senior         Process        Data, analytics,
                 Operator       Data/Process   Executive /    office automation
                                Assistant      Operations     

  VOC007         Assistant      Electrician    Senior         Solar, industrial
                 Electrician                   Electrician /  electrical work
                                               Supervisor     

  VOC008         Retail Sales   Senior         Store          Sales, retail
                 Associate      Associate /    Supervisor /   operations,
                                Team Leader    Manager        management
  --------------------------------------------------------------------------------

------------------------------------------------------------------------

# 4. Parent Concern Dataset

This dataset can be used by Samaira's conversation engine to identify
what the parent wants to know.

  -------------------------------------------------------------------------
  Concern ID        Parent Concern    Example Parent    Required Data
                                      Question          
  ----------------- ----------------- ----------------- -------------------
  CON001            Income            "How much can my  Starting +
                                      child earn?"      experienced
                                                        earnings

  CON002            Placement         "Will my child    Placement rate +
                                      get a job after   provider outcome
                                      the course?"      

  CON003            Career Growth     "Can they become  Career pathway
                                      something bigger  
                                      later?"           

  CON004            Job Security      "Is there demand  Demand/employment
                                      for this work?"   evidence

  CON005            Further Education "Can they study   NSQF progression +
                                      after this?"      education routes

  CON006            Social Perception "Is this a        Job roles +
                                      respectable       progression +
                                      career?"          evidence

  CON007            Safety            "Is this work     Safety
                                      safe?"            requirements + work
                                                        environment

  CON008            Location          "Will my child    Local providers +
                                      have to move      local employment
                                      away?"            data

  CON009            Duration          "How long will    Course duration
                                      the course take?" 

  CON010            Eligibility       "Can my child     Education +
                                      join this         eligibility
                                      course?"          

  CON011            Cost              "How much will    Fee/scholarship
                                      training cost?"   dataset

  CON012            Skills            "What will my     Skill list +
                                      child actually    practical
                                      learn?"           activities
  -------------------------------------------------------------------------

------------------------------------------------------------------------

# 5. Samaira Response Rules

Samaira should use the following hierarchy when answering:

``` text
1. Verified official/hackathon dataset
          ↓
2. Course-specific structured knowledge
          ↓
3. Current trusted external information, if enabled
          ↓
4. General LLM knowledge
          ↓
5. Human counsellor escalation if confidence is insufficient
```

## Never invent

Samaira should **not fabricate**:

-   Salary figures
-   Placement percentages
-   Government benefits
-   Qualification levels
-   Training-provider claims
-   Job guarantees
-   Admission eligibility
-   Safety certifications
-   Employment statistics

If the required information is unavailable:

> "I don't have verified data for that specific question yet. I can
> connect you with a counsellor or help you explore the information we
> do have."

------------------------------------------------------------------------

# 6. Language Dataset

Samaira should support:

  Language   Code    Use
  ---------- ------- -------------------------------
  English    en-IN   Default / bilingual users
  Gujarati   gu-IN   Regional-language counselling

### Example

**English**

> "The available data shows that this trade has opportunities in
> manufacturing and automotive industries."

**Gujarati**

> "ઉપલબ્ધ માહિતી પ્રમાણે, આ ટ્રેડમાં મેન્યુફેક્ચરિંગ અને ઓટોમોટિવ ક્ષેત્રોમાં રોજગારની
> તકો ઉપલબ્ધ છે."

The underlying career facts should remain the same; only the
presentation language should change.

------------------------------------------------------------------------

# 7. Recommended Database Structure

For implementation, convert the Markdown dataset into these database
tables:

``` text
courses
├── course_id
├── sector
├── trade_name
├── aliases
├── entry_education
├── duration
├── nsqf_level
├── work_environment
├── skills
├── job_roles
└── further_learning

career_pathways
├── course_id
├── stage
├── role
└── next_stage

outcomes
├── course_id
├── location
├── training_provider
├── placement_rate
├── starting_earnings_min
├── starting_earnings_max
├── experienced_earnings_min
├── experienced_earnings_max
├── data_year
└── source

parent_concerns
├── concern_id
├── concern_name
├── example_question
└── required_data

providers
├── provider_id
├── provider_name
├── location
├── courses
└── verified_outcomes
```

------------------------------------------------------------------------

# 8. AI/RAG Retrieval Examples

### Query 1

**Parent:** \> "Electrician banne ke baad salary kitni ho sakti hai?"

**Intent:** `income`

**Course:** `VOC001`

**Retrieve:** `outcomes → salary`

**Response:** Samaira should retrieve the verified value and explain it
naturally in Gujarati.

------------------------------------------------------------------------

### Query 2

**Parent:** \> "Electrician banne ke baad aage kya kar sakte hain?"

**Intent:** `career_growth`

**Retrieve:** `career_pathways → VOC001`

**Response:** Show the animated career pathway.

------------------------------------------------------------------------

### Query 3

**Parent:** \> "Mare dikra ne computer game ramva game chhe, pan office
ma besvu nathi gamtu."

**Intent:** `interest + work_preference`

**Action:** Use the student's profile + course knowledge to recommend
relevant practical/digital pathways rather than matching only a keyword.

------------------------------------------------------------------------

# 9. Dataset Expansion Plan

The initial prototype contains 8 trades, but the production architecture
should support:

-   50+ trades
-   Multiple NSQF levels
-   Multiple states
-   District-level information
-   Multiple training providers
-   Year-wise outcomes
-   Salary ranges
-   Placement rates
-   Further education pathways
-   Government schemes
-   Regional-language content

The **course ID should remain stable** so that additional outcome data
can be added without changing Samaira's conversation logic.

------------------------------------------------------------------------

# 10. Data Quality Labels

Every factual record should carry one of these labels:

  -----------------------------------------------------------------------
  Label                               Meaning
  ----------------------------------- -----------------------------------
  VERIFIED                            Supported by an official/trusted
                                      source

  HACKATHON_DATA                      Supplied by the hackathon

  SYNTHETIC_DEMO                      Created only for prototype testing

  NEEDS_VERIFICATION                  Information exists but requires
                                      validation

  OUTDATED                            Historical information that should
                                      not be used for current claims
  -----------------------------------------------------------------------

For the current prototype:

**All salary, placement and outcome values in this document =
`SYNTHETIC_DEMO`.**

------------------------------------------------------------------------

# 11. Suggested First Demo Scenario

For the SIH demonstration, use:

### Student

12th/10th-pass learner interested in practical technical work.

### Preferred trade

**Electrician --- VOC001**

### Parent's initial concern

> "Vocational courses don't have enough career growth."

### Samaira journey

``` text
Parent + Student
       ↓
Samaira introduction
       ↓
Student chooses Electrician
       ↓
Animated electrical workplace
       ↓
Samaira asks parent's concerns
       ↓
Parent selects Career Growth
       ↓
Career pathway animation
       ↓
Parent asks about salary
       ↓
Verified outcome data
       ↓
Parent asks about further education
       ↓
NSQF / progression information
       ↓
Parent asks an unexpected question
       ↓
LLM interprets the question
       ↓
RAG retrieves relevant evidence
       ↓
Gujarati response
       ↓
Sentiment changes
       ↓
Concern resolved OR human counsellor escalation
```

This single scenario demonstrates the central purpose of Problem
Statement **26241** without requiring the prototype to implement every
possible trade.
