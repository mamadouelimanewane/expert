export const UserRole = { ADMIN:"ADMIN", EXPERT:"EXPERT", COLLABORATOR:"COLLABORATOR", CLIENT:"CLIENT", ASSISTANT:"ASSISTANT" } as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];
export const ClientType = { ENTREPRISE:"ENTREPRISE", PARTICULIER:"PARTICULIER", ASSOCIATION:"ASSOCIATION" } as const;
export type ClientType = typeof ClientType[keyof typeof ClientType];
export const FiscalRegime = { REEL_NORMAL:"REEL_NORMAL", REEL_SIMPLIFIE:"REEL_SIMPLIFIE", CME:"CME", MICRO_ENTREPRISE:"MICRO_ENTREPRISE" } as const;
export type FiscalRegime = typeof FiscalRegime[keyof typeof FiscalRegime];
export const MissionStatus = { DRAFT:"DRAFT", IN_PROGRESS:"IN_PROGRESS", PENDING_REVIEW:"PENDING_REVIEW", COMPLETED:"COMPLETED", CANCELLED:"CANCELLED" } as const;
export type MissionStatus = typeof MissionStatus[keyof typeof MissionStatus];
export const MissionType = { AUDIT:"AUDIT", CONSEIL:"CONSEIL", TENUE_COMPTABLE:"TENUE_COMPTABLE", DECLARATION_FISCALE:"DECLARATION_FISCALE", PAIE:"PAIE", EXPERTISE_JUDICIAIRE:"EXPERTISE_JUDICIAIRE", AUTRE:"AUTRE" } as const;
export type MissionType = typeof MissionType[keyof typeof MissionType];
export const InvoiceStatus = { DRAFT:"DRAFT", SENT:"SENT", PAID:"PAID", OVERDUE:"OVERDUE", CANCELLED:"CANCELLED" } as const;
export type InvoiceStatus = typeof InvoiceStatus[keyof typeof InvoiceStatus];
export const DeclarationType = { TVA:"TVA", IS:"IS", IRPP:"IRPP", COTISATION_SOCIALE:"COTISATION_SOCIALE", AUTRE:"AUTRE" } as const;
export type DeclarationType = typeof DeclarationType[keyof typeof DeclarationType];
export const DeclarationStatus = { DRAFT:"DRAFT", PENDING:"PENDING", SUBMITTED:"SUBMITTED", VALIDATED:"VALIDATED", REJECTED:"REJECTED" } as const;
export type DeclarationStatus = typeof DeclarationStatus[keyof typeof DeclarationStatus];
export const DocumentType = { FACTURE:"FACTURE", RELEVE_BANCAIRE:"RELEVE_BANCAIRE", CONTRAT:"CONTRAT", RAPPORT:"RAPPORT", DECLARATION:"DECLARATION", PIECE_IDENTITE:"PIECE_IDENTITE", AUTRE:"AUTRE" } as const;
export type DocumentType = typeof DocumentType[keyof typeof DocumentType];
export const DocumentStatus = { UPLOADED:"UPLOADED", PROCESSING:"PROCESSING", PROCESSED:"PROCESSED", ERROR:"ERROR" } as const;
export type DocumentStatus = typeof DocumentStatus[keyof typeof DocumentStatus];
export const TimeEntryCategory = { PRODUCTION:"PRODUCTION", CONSEIL:"CONSEIL", AUDIT:"AUDIT", DEPLACEMENT:"DEPLACEMENT", REUNION:"REUNION", AUTRE:"AUTRE" } as const;
export type TimeEntryCategory = typeof TimeEntryCategory[keyof typeof TimeEntryCategory];
export const TimeEntryStatus = { DRAFT:"DRAFT", SUBMITTED:"SUBMITTED", APPROVED:"APPROVED", INVOICED:"INVOICED" } as const;
export type TimeEntryStatus = typeof TimeEntryStatus[keyof typeof TimeEntryStatus];
export const MeetingType = { VIRTUELLE:"VIRTUELLE", PRESENTIEL:"PRESENTIEL" } as const;
export type MeetingType = typeof MeetingType[keyof typeof MeetingType];
export const MeetingStatus = { PLANIFIE:"PLANIFIE", TERMINE:"TERMINE", ANNULE:"ANNULE" } as const;
export type MeetingStatus = typeof MeetingStatus[keyof typeof MeetingStatus];
export const NotificationType = { INFO:"INFO", WARNING:"WARNING", ERROR:"ERROR", SUCCESS:"SUCCESS" } as const;
export type NotificationType = typeof NotificationType[keyof typeof NotificationType];
export interface User { id:string; email:string; password:string; firstName:string; lastName:string; role:UserRole; phone:string|null; avatar:string|null; isActive:boolean; lastLoginAt:Date|null; createdAt:Date; updatedAt:Date; }
export interface Client { id:string; type:ClientType; companyName:string|null; firstName:string|null; lastName:string|null; email:string; phone:string; rccm:string|null; ninea:string|null; ifu:string|null; nif:string|null; fiscalRegime:FiscalRegime; sector:string|null; country:string; address:string|null; city:string|null; postalCode:string|null; isActive:boolean; createdAt:Date; updatedAt:Date; }
export interface Mission { id:string; title:string; description:string|null; type:MissionType; status:MissionStatus; startDate:Date; endDate:Date|null; deadline:Date|null; estimatedHours:number|null; hourlyRate:number|null; fixedPrice:number|null; clientId:string; assignedToId:string|null; createdById:string; createdAt:Date; updatedAt:Date; }
export interface Invoice { id:string; invoiceNumber:string; issueDate:Date; dueDate:Date; paidDate:Date|null; status:InvoiceStatus; subtotal:number; taxRate:number; taxAmount:number; total:number; notes:string|null; clientId:string; createdAt:Date; updatedAt:Date; }
export interface TaxDeclaration { id:string; type:DeclarationType; status:DeclarationStatus; period:string; dueDate:Date; submittedDate:Date|null; amount:number|null; reference:string|null; clientId:string; createdAt:Date; updatedAt:Date; }
export interface AuditLog { id:string; action:string; entity:string; entityId:string|null; details:string|null; oldValue:unknown; newValue:unknown; ipAddress:string|null; userAgent:string|null; userId:string|null; createdAt:Date; }
export interface Document { id:string; fileName:string; originalName:string; fileSize:number; mimeType:string; fileUrl:string; type:DocumentType; status:DocumentStatus; ocrData:unknown; ocrProcessedAt:Date|null; clientId:string|null; missionId:string|null; uploadedById:string; createdAt:Date; updatedAt:Date; }
