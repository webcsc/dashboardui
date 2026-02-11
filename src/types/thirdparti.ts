export interface ThirdPartie {
    module:                     Module;
    SupplierCategories:         never[];
    prefixCustomerIsRequired:   null;
    entity:                     string;
    name:                       string;
    name_alias:                 NameAlias | null;
    status:                     string;
    abonnement:                 number;
    phone:                      null | string;
    fax:                        null;
    email:                      null | string;
    no_email:                   null | string;
    skype:                      null;
    twitter:                    null;
    facebook:                   null;
    linkedin:                   null;
    url:                        null;
    barcode:                    null;
    idprof1:                    null | string;
    idprof2:                    null | string;
    idprof3:                    null | string;
    idprof4:                    null | string;
    idprof5:                    null | string;
    idprof6:                    null | string;
    socialobject:               null;
    tva_assuj:                  string;
    tva_intra:                  null | string;
    vat_reverse_charge:         number;
    localtax1_assuj:            null | string;
    localtax1_value:            null | string;
    localtax2_assuj:            null | string;
    localtax2_value:            null | string;
    managers:                   null;
    capital:                    null;
    typent_id:                  null | string;
    typent_code:                null;
    effectif:                   string;
    effectif_id:                null | string;
    forme_juridique_code:       null | string;
    forme_juridique:            string;
    remise_percent:             number;
    remise_supplier_percent:    string;
    mode_reglement_id:          null;
    cond_reglement_id:          null;
    deposit_percent:            null;
    mode_reglement_supplier_id: null;
    cond_reglement_supplier_id: null;
    transport_mode_supplier_id: null;
    fk_prospectlevel:           null | string;
    date_modification:          number;
    user_modification:          null | string;
    date_creation:              number;
    user_creation:              null | string;
    client:                     string;
    prospect:                   number;
    fournisseur:                string;
    code_client:                null | string;
    code_fournisseur:           null | string;
    code_compta_client:         null | string;
    code_compta:                null | string;
    accountancy_code_customer:  null;
    code_compta_fournisseur:    null;
    accountancy_code_supplier:  null;
    code_compta_product:        null;
    note_private:               null | string;
    note_public:                null;
    stcomm_id:                  string;
    stcomm_picto:               null;
    status_prospect_label:      StatusProspectLabel;
    price_level:                null;
    outstanding_limit:          null;
    order_min_amount:           null;
    supplier_order_min_amount:  null;
    parent:                     null;
    default_lang:               null | string;
    ref:                        string;
    ref_ext:                    null;
    import_key:                 ImportKey | null;
    webservices_url:            null;
    webservices_key:            null;
    logo:                       null | string;
    logo_small:                 null;
    logo_mini:                  null;
    logo_squarred:              null;
    logo_squarred_small:        null;
    logo_squarred_mini:         null;
    accountancy_code_sell:      null | string;
    accountancy_code_buy:       null | string;
    fk_multicurrency:           null | string;
    fk_warehouse:               null;
    multicurrency_code:         null | string;
    partnerships:               never[];
    bank_account:               null;
    id:                         string;
    array_options:              never[] | ArrayOptionsClass;
    array_languages:            null;
    contacts_ids:               null;
    linked_objects:             null;
    linkedObjectsIds:           null;
    oldref:                     null;
    canvas:                     null;
    fk_project:                 null;
    contact_id:                 null;
    user:                       null;
    origin:                     null;
    origin_id:                  null;
    statut:                     null;
    country_id:                 string;
    country_code:               CountryCode;
    state_id:                   null | string;
    region_id:                  null | string;
    barcode_type:               null;
    barcode_type_coder:         null;
    demand_reason_id:           null;
    transport_mode_id:          null;
    shipping_method_id:         null;
    shipping_method:            null;
    multicurrency_tx:           null;
    model_pdf:                  null | string;
    last_main_doc:              null;
    last_main_doc_url:          null;
    fk_bank:                    null;
    fk_account:                 string;
    lastname:                   null;
    firstname:                  null;
    civility_id:                null;
    date_validation:            null;
    date_update:                null;
    date_cloture:               null;
    user_author:                null;
    user_creation_id:           null;
    user_valid:                 null;
    user_validation:            null;
    user_validation_id:         null;
    user_closing_id:            null;
    user_modification_id:       null;
    specimen:                   number;
    labelStatus:                null;
    showphoto_on_popup:         null;
    nb:                         never[];
    output:                     null;
    extraparams:                never[];
    fk_incoterms:               null | string;
    label_incoterms:            null;
    location_incoterms:         null;
    socialnetworks:             never[];
    address:                    string;
    zip:                        null | string;
    town:                       null | string;
}

export interface ArrayOptionsClass {
    options_tarifduclientparkg: null | string;
    options_adresse2:           null | string;
}

export enum CountryCode {
    Be = "BE",
    De = "DE",
    Fr = "FR",
    It = "IT",
}

export enum ImportKey {
    P0116902517 = "P01-16902517",
    P0116913643 = "P01-16913643",
    P0116913645 = "P01-16913645",
    P0116913647 = "P01-16913647",
    P0116913650 = "P01-16913650",
    The20240711165442 = "20240711165442",
}

export enum Module {
    Societe = "societe",
}

export enum NameAlias {
    ALAttentionDeMMartinez = "A l'attention de M.Martinez",
    Casareto = "Casareto",
    Csc = "CSC",
    Empty = "",
    SeptseptAnonymized = "Septsept Anonymized",
}

export enum StatusProspectLabel {
    NeverContacted = "Never contacted",
}
