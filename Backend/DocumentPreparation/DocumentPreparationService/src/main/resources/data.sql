-- Tabela tok
INSERT INTO tok(id, naziv)
VALUES (1001, 'Tok Izrade Dokumenata');

INSERT INTO tok(id, naziv)
VALUES (1002, 'Tok Revizije');

-- Tabela projekat
INSERT INTO projekat(id, naziv, status, rok_zavrsetka, tok_projekta_id)
VALUES (1001, 'Projekat Alpha', 'u_toku', TO_DATE('2027-10-31','YYYY-MM-DD'), 1001);

INSERT INTO projekat(id, naziv, status, rok_zavrsetka, tok_projekta_id)
VALUES (1002, 'Projekat Beta', 'zavrsen', TO_DATE('2028-06-30','YYYY-MM-DD'), 1002);

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1001, 1001, 1001, 'vodja');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1002, 1002, 1001, 'menadzer');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1003, 1003, 1001, 'clan');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1004, 1004, 1001, 'clan');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1005, 1001, 1002, 'vodja');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1006, 1005, 1002, 'clan');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1007, 1006, 1002, 'clan');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1008, 1002, 1002, 'menadzer');

INSERT INTO status(id, naziv, potrebno_odobrenje_za_prelazak, dozvola_menjanja_za_vlasnika,
                     dozvola_dodavanja_za_vlasnika, dozvola_brisanja_za_vlasnika,
                     dozvola_citanja_za_vlasnika, dozvola_menjanja_za_zaduzenog,
                     dozvola_dodavanja_za_zaduzenog, dozvola_brisanja_za_zaduzenog,
                     dozvola_citanja_za_zaduzenog)
VALUES (1001, 'To do', 0, 1, 1, 1, 1, 1, 0, 0, 1);

INSERT INTO status(id, naziv, potrebno_odobrenje_za_prelazak, dozvola_menjanja_za_vlasnika,
                     dozvola_dodavanja_za_vlasnika, dozvola_brisanja_za_vlasnika,
                     dozvola_citanja_za_vlasnika, dozvola_menjanja_za_zaduzenog,
                     dozvola_dodavanja_za_zaduzenog, dozvola_brisanja_za_zaduzenog,
                     dozvola_citanja_za_zaduzenog)
VALUES (1002, 'In progress', 0, 1, 1, 1, 1, 1, 0, 0, 1);

INSERT INTO status(id, naziv, potrebno_odobrenje_za_prelazak, dozvola_menjanja_za_vlasnika,
                     dozvola_dodavanja_za_vlasnika, dozvola_brisanja_za_vlasnika,
                     dozvola_citanja_za_vlasnika, dozvola_menjanja_za_zaduzenog,
                     dozvola_dodavanja_za_zaduzenog, dozvola_brisanja_za_zaduzenog,
                     dozvola_citanja_za_zaduzenog)
VALUES (1003, 'In review', 1, 1, 1, 1, 1, 1, 0, 0, 1);

INSERT INTO status(id, naziv, potrebno_odobrenje_za_prelazak, dozvola_menjanja_za_vlasnika,
                     dozvola_dodavanja_za_vlasnika, dozvola_brisanja_za_vlasnika,
                     dozvola_citanja_za_vlasnika, dozvola_menjanja_za_zaduzenog,
                     dozvola_dodavanja_za_zaduzenog, dozvola_brisanja_za_zaduzenog,
                     dozvola_citanja_za_zaduzenog)
VALUES (1004, 'Done', 0, 1, 1, 0, 1, 1, 0, 0, 1);

INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1001, 1001, 1001, NULL, NULL);

INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1002, 1001, 1002, NULL, NULL);

INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1003, 1001, 1003, NULL, NULL);

INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1004, 1001, 1004, NULL, NULL);

INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1005, 1002, 1001, NULL, NULL);

INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1006, 1002, 1002, NULL, NULL);

COMMIT;

-- 2) UPDATE za veze nakon što svi redovi postoje
UPDATE tok_status SET sledece_stanje = 1002 WHERE id = 1001;

UPDATE tok_status SET sledece_stanje = 1003 WHERE id = 1002;

UPDATE tok_status SET sledece_stanje = 1004, status_nakon_odbijanja = 1002 WHERE id = 1003;

UPDATE tok_status SET sledece_stanje = 1002 WHERE id = 1005;


COMMIT;

-- Tabela fajl
INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1001, EMPTY_BLOB(), 1001, SYSTIMESTAMP, 'Uputstvo', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1002, EMPTY_BLOB(), 1001, SYSTIMESTAMP, 'Plan Projekta', 'docx');
INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1003, EMPTY_BLOB(), 1001, SYSTIMESTAMP, 'Plan grada', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1004, EMPTY_BLOB(), 1001, SYSTIMESTAMP, 'nesto', 'docx');
INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1005, EMPTY_BLOB(), 1001, SYSTIMESTAMP, 'novi fajl', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1006, EMPTY_BLOB(), 1001, SYSTIMESTAMP, 'skola', 'docx');
INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1007, EMPTY_BLOB(), 1002, SYSTIMESTAMP, 'Uputstvo v2', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1008, EMPTY_BLOB(), 1002, SYSTIMESTAMP, 'Plan Projekta v2', 'docx');

-- Tabela dokument
INSERT INTO dokument(id, projekat_id, naziv, opis, tok_izrade_dokumenta, status, prioritet, roditelj_dokument_id, glavni_fajl_id, vlasnik, rok_zavrsetka,pripremna_verzija)
VALUES (1001, 1001, 'Dokument 1001', 'Opis dokumenta 1001', 1001, 1001, 'visok', NULL, 1007, 1002,TO_DATE('2026-6-15','YYYY-MM-DD'),0);

INSERT INTO dokument(id, projekat_id, naziv, opis, tok_izrade_dokumenta, status, prioritet, roditelj_dokument_id, glavni_fajl_id, vlasnik,rok_zavrsetka,pripremna_verzija)
VALUES (1002, 1001, 'Dokument 1002', 'Opis dokumenta 1002', 1001, 1002, 'srednji', 1001, 1008, 1001,TO_DATE('2026-10-15','YYYY-MM-DD'),0);

INSERT INTO dokument(id, projekat_id, naziv, opis, tok_izrade_dokumenta, status, prioritet, roditelj_dokument_id, glavni_fajl_id, vlasnik, rok_zavrsetka,pripremna_verzija)
VALUES (1003, 1001, 'Dokument 1003', 'Opis dokumenta 1003', 1001, 1003, 'visok', NULL, 1003, 1002,TO_DATE('2026-5-15','YYYY-MM-DD'),0);

INSERT INTO dokument(id, projekat_id, naziv, opis, tok_izrade_dokumenta, status, prioritet, roditelj_dokument_id, glavni_fajl_id, vlasnik, rok_zavrsetka,pripremna_verzija)
VALUES (1004, 1001, 'Dokument 1004', 'Opis dokumenta 1004', 1001, 1004, 'srednji', NULL, 1004, 1002,TO_DATE('2026-4-15','YYYY-MM-DD'),0);

INSERT INTO dokument(id, projekat_id, naziv, opis, tok_izrade_dokumenta, status, prioritet, roditelj_dokument_id, glavni_fajl_id, vlasnik, rok_zavrsetka,pripremna_verzija)
VALUES (1005, 1002, 'Dokument 1001', 'Opis dokumenta 1001', 1001, 1001, 'visok', NULL, 1005, 1008,TO_DATE('2025-12-15','YYYY-MM-DD'),0);

INSERT INTO dokument(id, projekat_id, naziv, opis, tok_izrade_dokumenta, status, prioritet, roditelj_dokument_id, glavni_fajl_id, vlasnik, rok_zavrsetka,pripremna_verzija)
VALUES (1006, 1002, 'Dokument 1002', 'Opis dokumenta 1002', 1001, 1002, 'srednji', NULL, 1006, 1008,TO_DATE('2025-11-15','YYYY-MM-DD'),0);

-- Tabela dokument_revizija
INSERT INTO dokument_revizija(id, dokument_id, odobreno, trenutni_status, pregledac_id)
VALUES (1001, 1004, 0, 1003, 1002);

INSERT INTO dokument_revizija(id, dokument_id, odobreno, trenutni_status, pregledac_id)
VALUES (1002, 1004, 1, 1003, 1002);


-- Tabela revizija_izmena
INSERT INTO revizija_izmena(id, revizija_id, izmena, ispravljena,datum_ispravljanja)
VALUES (1001, 1001, 'Ispravi naslov', 1,SYSTIMESTAMP);

INSERT INTO revizija_izmena(id, revizija_id, izmena, ispravljena,datum_ispravljanja)
VALUES (1002, 1001, 'Dopuni opis', 1,SYSTIMESTAMP);


-- Tabela dokument_fajl
INSERT INTO dokument_fajl(dokument_id, fajl_id)
VALUES (1001, 1001);

INSERT INTO dokument_fajl(dokument_id, fajl_id)
VALUES (1002, 1002);
INSERT INTO dokument_fajl(dokument_id, fajl_id)
VALUES (1003, 1003);

INSERT INTO dokument_fajl(dokument_id, fajl_id)
VALUES (1004, 1004);
INSERT INTO dokument_fajl(dokument_id, fajl_id)
VALUES (1001, 1007);

INSERT INTO dokument_fajl(dokument_id, fajl_id)
VALUES (1005, 1005);
INSERT INTO dokument_fajl(dokument_id, fajl_id)
VALUES (1006, 1006);

INSERT INTO dokument_fajl(dokument_id, fajl_id)
VALUES (1002, 1008);

-- Tabela dokument_aktivni_fajl
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id)
VALUES (1001, 1007);

INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id)
VALUES (1002, 1008);
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id)
VALUES (1003, 1003);

INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id)
VALUES (1004, 1004);
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id)
VALUES (1005, 1005);

INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id)
VALUES (1006, 1006);


-- Tabela dokument_zavisnost
INSERT INTO dokument_zavisnost(dokument_id, zavisi_od)
VALUES (1001, 1003);


-- Tabela korisnik_dokument
INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1001, 1001);

INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1003, 1002);
INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1004, 1002);

INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1001, 1003);
INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1001, 1004);

INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1005, 1002);
INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1005, 1001);


-- Tabela obavestenje
INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1001, 'Novi dokument kreiran', 1001, 0, 1001);

INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1002, 'Dokument ažuriran', 1003, 1, 1002);


-- Tabela status_log
INSERT INTO status_log(id, datum, izvrsilac, dokument, projekat_id, prethodno_stanje, novo_stanje)
VALUES (1001, SYSTIMESTAMP, 1002, 1001, 1001, NULL, 1001);

INSERT INTO status_log(id, datum, izvrsilac, dokument, projekat_id, prethodno_stanje, novo_stanje)
VALUES (1002, SYSTIMESTAMP, 1001, 1002, 1001, NULL, 1001);
INSERT INTO status_log(id, datum, izvrsilac, dokument, projekat_id, prethodno_stanje, novo_stanje)
VALUES (1003, SYSTIMESTAMP, 1003, 1002, 1001, 1001, 1002);
INSERT INTO status_log(id, datum, izvrsilac, dokument, projekat_id, prethodno_stanje, novo_stanje)
VALUES (1004, SYSTIMESTAMP, 1002, 1003, 1001, NULL, 1001);

INSERT INTO status_log(id, datum, izvrsilac, dokument, projekat_id, prethodno_stanje, novo_stanje)
VALUES (1005, SYSTIMESTAMP, 1002, 1003, 1001, 1001, 1002);
INSERT INTO status_log(id, datum, izvrsilac, dokument, projekat_id, prethodno_stanje, novo_stanje)
VALUES (1006, SYSTIMESTAMP, 1002, 1003, 1001, 1002, 1003);

INSERT INTO status_log(id, datum, izvrsilac, dokument, projekat_id, prethodno_stanje, novo_stanje)
VALUES (1007, SYSTIMESTAMP, 1002, 1004, 1001, NULL, 1001);
INSERT INTO status_log(id, datum, izvrsilac, dokument, projekat_id, prethodno_stanje, novo_stanje)
VALUES (1008, SYSTIMESTAMP, 1002, 1004, 1001, 1001, 1002);
INSERT INTO status_log(id, datum, izvrsilac, dokument, projekat_id, prethodno_stanje, novo_stanje)
VALUES (1009, SYSTIMESTAMP, 1002, 1004, 1001, 1002, 1003);

INSERT INTO status_log(id, datum, izvrsilac, dokument, projekat_id, prethodno_stanje, novo_stanje)
VALUES (1010, SYSTIMESTAMP, 1002, 1004, 1001, 1003, 1002);
INSERT INTO status_log(id, datum, izvrsilac, dokument, projekat_id, prethodno_stanje, novo_stanje)
VALUES (1011, SYSTIMESTAMP, 1002, 1004, 1001, 1002, 1003);
INSERT INTO status_log(id, datum, izvrsilac, dokument, projekat_id, prethodno_stanje, novo_stanje)
VALUES (1012, SYSTIMESTAMP, 1002, 1004, 1001, 1003, 1004);

INSERT INTO status_log(id, datum, izvrsilac, dokument, projekat_id, prethodno_stanje, novo_stanje)
VALUES (1013, SYSTIMESTAMP, 1008, 1005, 1002, NULL, 1001);
INSERT INTO status_log(id, datum, izvrsilac, dokument, projekat_id, prethodno_stanje, novo_stanje)
VALUES (1014, SYSTIMESTAMP, 1008, 1006, 1002, NULL, 1001);



-- Tabela statistika_projekta
INSERT INTO statistika_projekta(id, projekat_id, broj_neispostovanih_rokova, broj_zatrazenih_ispravki, procenat_ispostovanosti_zadatog_roka)
VALUES (1001, 1001, 1002, 1001, 80);

-- Tabela statistika_projektnih_dokumenata
INSERT INTO statistika_projektnih_dokumenata(id, statistika_projekta_id, dokument_id, prekoracenje_roka_u_procentima)
VALUES (1001, 1001, 1001, 1010);

INSERT INTO statistika_projektnih_dokumenata(id, statistika_projekta_id, dokument_id, prekoracenje_roka_u_procentima)
VALUES (1002, 1001, 1002, 1005);

