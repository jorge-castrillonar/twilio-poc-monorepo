# TrueAccord Data Models Transformation Tasks

## Project Goal
Transform the scraped TrueAccord API data models into MapParser structure format, following the pattern established in `sample.json`.

## MapParser Structure Directives

### Rules:
1. **All `id` fields must be**: `"MapParser"`
2. **Type definitions**:
   - `type: "static"` - Include the actual text value in the `value` field
   - `type: "data"` - The `value` is a reference to extract data from files, with `dataType` for visual representation
   - `type: "expression"` - Used with JavaScript functions to process or transform data
3. **DataType options**: `"number"`, `"amount"`, `"string"`

---

## Tasks

### Phase 1: Core Models

#### ✅ Task 1: Transform Customer.json to MapParser format
**Status**: Not Started  
**Priority**: High  
**Description**: Convert Customer model fields to MapParser structure with id, type (data/static/expression), value, and dataType.

**Fields to transform**:
- `name` (firstName, middleName, lastName)
- `dateOfBirth` (year, month, day)
- `businesses` array (name, url)
- `addresses` array (streetLine1, streetLine2, city, state, zipcode, countryCode, types)
- `phones` array (phoneNumber, types)
- `emails` array (email, types)
- `comments` array
- `reference`
- `ssn`
- `debts` array (reference to Debt model)

**Output File**: `Customer-MapParser.json`

---

#### ✅ Task 2: Transform Debt.json to MapParser format
**Status**: Not Started  
**Priority**: High  
**Description**: Convert Debt model to MapParser structure including all debt-related fields.

**Fields to transform**:
- `biller`
- `product`
- `initialPrincipal` (MonetaryAmount)
- `initialInterest` (MonetaryAmount)
- `initialFees` (MonetaryAmount)
- `transactionId`
- `transactionIp`
- `transactionTimestamp`
- `defaultTimestamp`
- `accountOpenTimestamp`
- `clientFields` array (key, value pairs)
- `sendCbrNegativeNotice` (boolean)
- `hasSentCbrNegativeNotice` (boolean)
- `postChargeOffInformation` (nested object)
- `itemizationTimestamp`
- `initialPaymentsAndCredits`
- `isInitialPrincipalBeforePaymentsAndCredits`
- `creditorName`
- `originalCreditorName`

**Output File**: `Debt-MapParser.json`

---

#### ✅ Task 3: Transform MonetaryAmount.json to MapParser format
**Status**: Not Started  
**Priority**: High  
**Description**: Convert MonetaryAmount model with amount and currency fields.

**Fields to transform**:
- `amount` (type: data, dataType: amount)
- `currency` (type: static, value: "USD")

**Output File**: `MonetaryAmount-MapParser.json`

---

#### ✅ Task 4: Transform Date.json to MapParser format
**Status**: Not Started  
**Priority**: High  
**Description**: Convert Date model with day, month, year fields.

**Fields to transform**:
- `day` (type: expression, dataType: number)
- `month` (type: expression, dataType: number)
- `year` (type: expression, dataType: number)

**Note**: Use expressions to parse date strings (YYYYMMDD format)

**Output File**: `Date-MapParser.json`

---

#### ✅ Task 5: Transform PostalAddress.json to MapParser format
**Status**: Not Started  
**Priority**: High  
**Description**: Convert PostalAddress model to MapParser structure.

**Fields to transform**:
- `name` (Name model reference)
- `streetLine1`
- `streetLine2`
- `city`
- `state`
- `zipcode`
- `countryCode`

**Output File**: `PostalAddress-MapParser.json`

---

#### ✅ Task 6: Transform PhoneNumber.json to MapParser format
**Status**: Not Started  
**Priority**: Medium  
**Description**: Convert PhoneNumber model with phoneNumber field and types array.

**Fields to transform**:
- `phoneNumber` (type: data)
- `dataSource` (nested object)
- `consent` (nested object)
- `types` (array - may need expression for mapping)

**Output File**: `PhoneNumber-MapParser.json`

---

### Phase 2: Payment & Balance Models

#### ✅ Task 7: Transform Payment.json to MapParser format
**Status**: Not Started  
**Priority**: Medium  
**Description**: Convert Payment model to MapParser structure.

**Fields to transform**:
- `meta` (Metadata reference)
- `amount` (MonetaryAmount)
- `payee` (enum)
- `transactionReference`
- `note`
- `transactionType` (enum)
- `paymentTimestamp`

**Output File**: `Payment-MapParser.json`

---

#### ✅ Task 8: Transform BalanceSnapshot.json to MapParser format
**Status**: Not Started  
**Priority**: Medium  
**Description**: Convert BalanceSnapshot model with balance breakdown.

**Fields to transform**:
- `principal` (MonetaryAmount)
- `interest` (MonetaryAmount)
- `fees` (MonetaryAmount)
- `costs` (MonetaryAmount)
- `notes`

**Output File**: `BalanceSnapshot-MapParser.json`

---

#### ✅ Task 9: Transform PaymentPlan.json to MapParser format
**Status**: Not Started  
**Priority**: Medium  
**Description**: Convert PaymentPlan model including application details.

**Fields to transform**:
- `application` (nested object with installments, frequency, consent, debtId, amountToPay, discount)
- `nextInstallment`
- `paymentMethodInfo`
- `revocation`
- `fullyPaid`
- `installments` array
- `debtStateId`
- `isRecurring`

**Output File**: `PaymentPlan-MapParser.json`

---

### Phase 3: Representation & Creditor Models

#### ✅ Task 10: Transform AttorneyRepresentation.json to MapParser format
**Status**: Not Started  
**Priority**: Low  
**Description**: Convert AttorneyRepresentation model.

**Fields to transform**:
- `contactInfo` (ContactInfo nested object)
- `email`
- `requestedBy` (enum)
- `communicationType` (enum)
- `receivedPowerOfAttorneyDocumentation` (boolean)

**Output File**: `AttorneyRepresentation-MapParser.json`

---

#### ✅ Task 11: Transform DebtConsolidatorRepresentation.json to MapParser format
**Status**: Not Started  
**Priority**: Low  
**Description**: Convert DebtConsolidatorRepresentation model.

**Fields to transform**:
- `debtConsolidatorType` (enum)
- `contactInfo` (ContactInfo nested object)
- `email`
- `requestedBy` (enum)
- `communicationType` (enum)
- `receivedPowerOfAttorneyDocumentation` (boolean)
- `offerPercentOfBalance`
- `offerDurationInMonths`

**Output File**: `DebtConsolidatorRepresentation-MapParser.json`

---

#### ✅ Task 12: Transform Creditor.json to MapParser format
**Status**: Not Started  
**Priority**: Medium  
**Description**: Convert Creditor model.

**Fields to transform**:
- `companyName`
- `industry`
- `environment` (enum: LIVE, TEST, INTERNAL_TEST)
- `activationStatus` (enum: ACTIVE, NOT_APPLIED, etc.)
- `commissionPercentBasisPoint`

**Output File**: `Creditor-MapParser.json`

---

#### ✅ Task 13: Transform CreditorBrand.json to MapParser format
**Status**: Not Started  
**Priority**: Medium  
**Description**: Convert CreditorBrand model.

**Fields to transform**:
- `logoUrl`
- `type` (enum: DOING_BUSINESS_AS, ORIGINAL)
- `name`
- `address` (PostalAddress reference)
- `meta` (Metadata reference)
- `description`
- `websiteUrl`
- `brandDetails` (nested object: originalCreditor, merchant, productType)

**Output File**: `CreditorBrand-MapParser.json`

---

#### ✅ Task 14: Transform Metadata.json to MapParser format
**Status**: Not Started  
**Priority**: Medium  
**Description**: Convert Metadata model.

**Fields to transform**:
- `id`
- `isActive` (boolean)
- `isPrimary` (boolean)
- `timeCreated` (timestamp)
- `lastModified` (timestamp)

**Output File**: `Metadata-MapParser.json`

---

### Phase 4: Utility Models

#### ✅ Task 15: Transform remaining utility models to MapParser format
**Status**: Not Started  
**Priority**: Low  
**Description**: Convert DataSource, Error, DuplicatedReference, and Timestamp models.

**Models to transform**:
- `DataSource` (type enum: CREDITOR, CUSTOMER)
- `Error` (errorCode, message, reference)
- `DuplicatedReference` (reference, transactionId)
- `Timestamp` (milliseconds since epoch)

**Output Files**: 
- `DataSource-MapParser.json`
- `Error-MapParser.json`
- `DuplicatedReference-MapParser.json`
- `Timestamp-MapParser.json`

---

### Phase 5: Integration & Validation

#### ✅ Task 16: Create master template combining all models
**Status**: Not Started  
**Priority**: High  
**Description**: Create a comprehensive trueaccord-mapparser-template.json file.

**Requirements**:
- Combine all transformed models in proper hierarchy
- Follow the structure pattern from `sample.json`
- Include `customers` array as root
- Nest all related models appropriately (Debt within Customer, MonetaryAmount within Debt, etc.)
- Ensure all relationships between models are maintained

**Output File**: `trueaccord-mapparser-template.json`

---

#### ✅ Task 17: Validate and test transformed models
**Status**: Not Started  
**Priority**: High  
**Description**: Review all transformed files for accuracy and completeness.

**Validation Checklist**:
- [ ] All `id` fields are set to `"MapParser"`
- [ ] Types are correctly assigned (`data` / `static` / `expression`)
- [ ] Static values are provided where type is `"static"`
- [ ] Data values reference correct field names where type is `"data"`
- [ ] Expressions use proper JavaScript functions where type is `"expression"`
- [ ] DataTypes are appropriate (`number` / `amount` / `string`)
- [ ] All required fields from TrueAccord API are included
- [ ] Model relationships are properly maintained
- [ ] Array structures are correctly formatted
- [ ] Nested objects follow the MapParser pattern recursively

**Documentation**: Create validation report in `VALIDATION_REPORT.md`

---

## Progress Tracking

- **Total Tasks**: 17
- **Completed**: 0
- **In Progress**: 0
- **Not Started**: 17

---

## Notes

### Common Patterns to Follow:

#### Static Value Example:
```json
{
  "id": "MapParser",
  "type": "static",
  "value": "USD"
}
```

#### Data Reference Example:
```json
{
  "id": "MapParser",
  "type": "data",
  "value": "FIRST_NAME"
}
```

#### Expression Example:
```json
{
  "id": "MapParser",
  "type": "expression",
  "value": "function process(data) { if(data['DATE_OF_BIRTH']) { return parseInt(data['DATE_OF_BIRTH'].substring(0, 4)).toString() } return ''; }",
  "dataType": "number"
}
```

#### MonetaryAmount Pattern:
```json
{
  "amount": {
    "id": "MapParser",
    "type": "data",
    "value": "ACCOUNT_BALANCE",
    "dataType": "amount"
  },
  "currency": {
    "id": "MapParser",
    "type": "static",
    "value": "USD"
  }
}
```

---

## File Organization

```
backend/models/
├── sample.json                              (reference file)
├── TASKS.md                                 (this file)
├── VALIDATION_REPORT.md                     (to be created)
│
├── Original Models (from web scraping)
│   ├── Customer.json
│   ├── Debt.json
│   ├── MonetaryAmount.json
│   └── ... (other models)
│
├── MapParser Transformed Models
│   ├── Customer-MapParser.json
│   ├── Debt-MapParser.json
│   ├── MonetaryAmount-MapParser.json
│   └── ... (other transformed models)
│
└── trueaccord-mapparser-template.json       (master template)
```

---

## References

- **TrueAccord API Documentation**: https://docs.trueaccord.com/recover/recover-api-reference
- **Sample File**: `sample.json` (current working example)
- **Original Models Directory**: Current workspace folder

---

*Last Updated: November 11, 2025*
