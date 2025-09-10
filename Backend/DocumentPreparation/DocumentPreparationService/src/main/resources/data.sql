-- TOK
INSERT INTO tok (id, naziv) VALUES (1000, 'Tok - Document realisation');
INSERT INTO tok (id, naziv) VALUES (1001, 'Tok - Project realisation');
INSERT INTO tok (id, naziv) VALUES (1002, 'Tok - Document realisation 2');





-- STATUS
INSERT INTO status (id, naziv, potrebno_odobrenje_za_prelazak,dozvola_menjanja_za_vlasnika, dozvola_dodavanja_za_vlasnika,dozvola_brisanja_za_vlasnika, dozvola_citanja_za_vlasnika,dozvola_menjanja_za_zaduzenog, dozvola_dodavanja_za_zaduzenog,dozvola_brisanja_za_zaduzenog, dozvola_citanja_za_zaduzenog)
VALUES (1000, 'Draft', 0,1,1,1,1,0,0,0,0);

INSERT INTO status (id, naziv, potrebno_odobrenje_za_prelazak,dozvola_menjanja_za_vlasnika, dozvola_dodavanja_za_vlasnika,dozvola_brisanja_za_vlasnika, dozvola_citanja_za_vlasnika,dozvola_menjanja_za_zaduzenog, dozvola_dodavanja_za_zaduzenog,dozvola_brisanja_za_zaduzenog, dozvola_citanja_za_zaduzenog)
VALUES (1001, 'To do', 1,1,1,0,1,1,1,1,1);

INSERT INTO status (id, naziv, potrebno_odobrenje_za_prelazak,dozvola_menjanja_za_vlasnika, dozvola_dodavanja_za_vlasnika,dozvola_brisanja_za_vlasnika, dozvola_citanja_za_vlasnika,dozvola_menjanja_za_zaduzenog, dozvola_dodavanja_za_zaduzenog,dozvola_brisanja_za_zaduzenog, dozvola_citanja_za_zaduzenog)
VALUES (1002, 'In progress', 0,0,0,0,1,1,1,1,1);

INSERT INTO status (id, naziv, potrebno_odobrenje_za_prelazak,dozvola_menjanja_za_vlasnika, dozvola_dodavanja_za_vlasnika,dozvola_brisanja_za_vlasnika, dozvola_citanja_za_vlasnika,dozvola_menjanja_za_zaduzenog, dozvola_dodavanja_za_zaduzenog,dozvola_brisanja_za_zaduzenog, dozvola_citanja_za_zaduzenog)
VALUES (1003, 'In review', 1,1,0,0,1,0,0,0,1);

INSERT INTO status (id, naziv, potrebno_odobrenje_za_prelazak,dozvola_menjanja_za_vlasnika, dozvola_dodavanja_za_vlasnika,dozvola_brisanja_za_vlasnika, dozvola_citanja_za_vlasnika,dozvola_menjanja_za_zaduzenog, dozvola_dodavanja_za_zaduzenog,dozvola_brisanja_za_zaduzenog, dozvola_citanja_za_zaduzenog)
VALUES (1004, 'Done', 1,1,0,0,1,0,0,0,1);

INSERT INTO status (id, naziv, potrebno_odobrenje_za_prelazak,dozvola_menjanja_za_vlasnika, dozvola_dodavanja_za_vlasnika,dozvola_brisanja_za_vlasnika, dozvola_citanja_za_vlasnika,dozvola_menjanja_za_zaduzenog, dozvola_dodavanja_za_zaduzenog,dozvola_brisanja_za_zaduzenog, dozvola_citanja_za_zaduzenog)
VALUES (1005, 'Revision', 0,0,0,0,1,1,0,0,1);

INSERT INTO status (id, naziv, potrebno_odobrenje_za_prelazak,dozvola_menjanja_za_vlasnika, dozvola_dodavanja_za_vlasnika,dozvola_brisanja_za_vlasnika, dozvola_citanja_za_vlasnika,dozvola_menjanja_za_zaduzenog, dozvola_dodavanja_za_zaduzenog,dozvola_brisanja_za_zaduzenog, dozvola_citanja_za_zaduzenog)
VALUES (1006, 'Archive', 0,0,0,0,1,0,0,0,1);

INSERT INTO status (id, naziv, potrebno_odobrenje_za_prelazak,dozvola_menjanja_za_vlasnika, dozvola_dodavanja_za_vlasnika,dozvola_brisanja_za_vlasnika, dozvola_citanja_za_vlasnika,dozvola_menjanja_za_zaduzenog, dozvola_dodavanja_za_zaduzenog,dozvola_brisanja_za_zaduzenog, dozvola_citanja_za_zaduzenog)
VALUES (1007, 'Internal review', 0,0,0,0,1,1,1,1,1);

INSERT INTO status (id, naziv, potrebno_odobrenje_za_prelazak,dozvola_menjanja_za_vlasnika, dozvola_dodavanja_za_vlasnika,dozvola_brisanja_za_vlasnika, dozvola_citanja_za_vlasnika,dozvola_menjanja_za_zaduzenog, dozvola_dodavanja_za_zaduzenog,dozvola_brisanja_za_zaduzenog, dozvola_citanja_za_zaduzenog)
VALUES (1008, 'QA review', 1,1,0,0,1,0,0,0,1);

INSERT INTO status (id, naziv, potrebno_odobrenje_za_prelazak,dozvola_menjanja_za_vlasnika, dozvola_dodavanja_za_vlasnika,dozvola_brisanja_za_vlasnika, dozvola_citanja_za_vlasnika,dozvola_menjanja_za_zaduzenog, dozvola_dodavanja_za_zaduzenog,dozvola_brisanja_za_zaduzenog, dozvola_citanja_za_zaduzenog)
VALUES (1009, 'Final draft', 0,0,0,0,1,1,0,1,1);






--TOK STATUS
                                --TOK DOKUMENTA
--                          TODO IN_PROGRESS DONE
INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1000, 1000, 1001, NULL, NULL);

INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1001, 1000, 1002, NULL, NULL);

INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1002, 1000, 1004, NULL, NULL);

UPDATE tok_status SET sledece_stanje = 1001 WHERE id = 1000;
UPDATE tok_status SET sledece_stanje = 1002 WHERE id = 1001;
UPDATE tok_status SET status_nakon_odbijanja = 1001 WHERE id = 1002;

                                --TOK PROJEKTA
--                          DRAFT TODO IN_PROGRESS REVIEW DONE ARCHIVE
INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1003, 1001, 1000, NULL, NULL);

INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1004, 1001, 1001, NULL, NULL);

INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1005, 1001, 1002, NULL, NULL);

INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1006, 1001, 1003, NULL, NULL);

INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1007, 1001, 1004, NULL, NULL);

INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1008, 1001, 1006, NULL, NULL);

UPDATE tok_status SET sledece_stanje = 1004 WHERE id = 1003;
UPDATE tok_status SET sledece_stanje = 1005 WHERE id = 1004;
UPDATE tok_status SET sledece_stanje = 1006 WHERE id = 1005;
UPDATE tok_status SET sledece_stanje = 1007, status_nakon_odbijanja = 1005 WHERE id = 1006;
UPDATE tok_status SET sledece_stanje = 1008, status_nakon_odbijanja = 1005 WHERE id = 1007;

                                    --TOK PROJEKTA 2
--                          DRAFT TODO IN_PROGRESS REVIEW DONE REVISION
INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1009, 1002, 1001, NULL, NULL);

INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1010, 1002, 1002, NULL, NULL);

INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1011, 1002, 1003, NULL, NULL);

INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1012, 1002, 1004, NULL, NULL);

INSERT INTO tok_status(id, tok_id, trenutno_stanje, sledece_stanje, status_nakon_odbijanja)
VALUES (1013, 1002, 1005, NULL, NULL);

UPDATE tok_status SET sledece_stanje = 1010 WHERE id = 1009;
UPDATE tok_status SET sledece_stanje = 1011 WHERE id = 1010;
UPDATE tok_status SET sledece_stanje = 1012, status_nakon_odbijanja = 1013 WHERE id = 1011;
UPDATE tok_status SET sledece_stanje = NULL WHERE id = 1012;
UPDATE tok_status SET sledece_stanje = 1011 WHERE id = 1013;






-------------------------------------------------------------------------------------------------------------------
-- PROJEKAT         1002 i 1003 su bitni

INSERT INTO projekat(id, naziv, status, rok_zavrsetka, tok_projekta_id)
VALUES (1000, 'Wetland Restoration Project', 'zavrsen', TO_DATE('2021-10-31','YYYY-MM-DD'),1002);

INSERT INTO projekat(id, naziv, status, rok_zavrsetka, tok_projekta_id)
VALUES (1001, 'Large-Scale Solar Farm Installation', 'obustavljen', TO_DATE('2020-10-31','YYYY-MM-DD'), 1002);

INSERT INTO projekat(id, naziv, status, rok_zavrsetka, tok_projekta_id)
VALUES (1002, 'Urban Air Pollution Reduction Program', 'u_toku', TO_DATE('2030-10-31','YYYY-MM-DD'), 1001);

INSERT INTO projekat(id, naziv, status, rok_zavrsetka, tok_projekta_id)
VALUES (1003, 'Forest Ecosystem Restoration and Tree Planting', 'u_toku', TO_DATE('2027-10-31','YYYY-MM-DD'), 1001);



--KORISNIK PROJEKAT


--TODO                      TRECI PROJEKAT 1002

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1000, 1, 1002, 'menadzer');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1001, 2, 1002, 'vodja');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1002, 3, 1002, 'clan');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1003, 4, 1002, 'clan');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1004, 5, 1002, 'clan');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1005, 6, 1002, 'clan');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1006, 7, 1002, 'vodja');


--TODO                      CETVRTI PROJEKAT 1003

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1007, 10, 1003, 'menadzer');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1008, 3, 1003, 'vodja');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1009, 7, 1003, 'clan');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1010, 8, 1003, 'clan');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1011, 9, 1003, 'clan');

--TODO                      PRVI PROJEKAT 1000

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1012, 1, 1000, 'menadzer');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1013, 2, 1000, 'vodja');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1014, 3, 1000, 'clan');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1015, 4, 1000, 'clan');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1016, 5, 1000, 'vodja');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1017, 6, 1000, 'clan');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1018, 7, 1000, 'clan');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1019, 8, 1000, 'clan');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1020, 9, 1000, 'vodja');

--TODO                      DRUGI PROJEKAT 1001

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1021, 1, 1001, 'menadzer');

INSERT INTO korisnik_projekat(id, korisnik_id, projekat_id, uloga_u_projektu)
VALUES (1022, 4, 1001, 'vodja');



--------------------------------------------------------------------------------------------------------------

    --FAJL

--- TODO                        GLAVNI FAJLOVI PROJEKAT 1002

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1002, UTL_RAW.CAST_TO_RAW('Sample data 3'), 2, SYSTIMESTAMP + INTERVAL '2' MINUTE, 'Impact Assessment', 'doc');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1003, UTL_RAW.CAST_TO_RAW('Sample data 4'), 2, SYSTIMESTAMP + INTERVAL '3' MINUTE, 'Mitigation Strategies', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1004, UTL_RAW.CAST_TO_RAW('Sample data 5'), 2, SYSTIMESTAMP + INTERVAL '4' MINUTE, 'Implementation Schedule', 'docx');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1005, UTL_RAW.CAST_TO_RAW('Sample data 6'), 2, SYSTIMESTAMP + INTERVAL '5' MINUTE, 'Stakeholder Report', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1006, UTL_RAW.CAST_TO_RAW('Sample data 7'), 2, SYSTIMESTAMP + INTERVAL '6' MINUTE, 'Progress Evaluation', 'docx');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1007, UTL_RAW.CAST_TO_RAW('Sample data 8'), 3, SYSTIMESTAMP + INTERVAL '7' MINUTE, 'Regulatory Compliance', 'pdf');
INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1008, UTL_RAW.CAST_TO_RAW('Sample data 9'), 3, SYSTIMESTAMP + INTERVAL '8' MINUTE, 'Tech Assessment', 'docx');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1010, UTL_RAW.CAST_TO_RAW('Sample data 11'), 3, SYSTIMESTAMP + INTERVAL '10' MINUTE, 'Cost-Benefit Analysis', 'pdf');
INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1011, UTL_RAW.CAST_TO_RAW('Sample data 12'), 3, SYSTIMESTAMP + INTERVAL '11' MINUTE, 'Emergency Response Plan', 'pdf');

--- TODO                        GLAVNI FAJLOVI PROJEKAT 1003

--- TODO                        GLAVNI FAJLOVI PROJEKAT 1000

--- TODO                        GLAVNI FAJLOVI PROJEKAT 1001

--- TODO                        SVI AKTIVNI FAJLOVI PROJEKAT 1002

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1000, UTL_RAW.CAST_TO_RAW('Sample data 1'), 2, SYSTIMESTAMP, 'Emission Report', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1001, UTL_RAW.CAST_TO_RAW('Sample data 2'), 2, SYSTIMESTAMP + INTERVAL '1' MINUTE, 'Air Monitoring Plan', 'docx');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1009, UTL_RAW.CAST_TO_RAW('Sample data 10'), 3, SYSTIMESTAMP + INTERVAL '9' MINUTE, 'Public Awareness Plan', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1013, UTL_RAW.CAST_TO_RAW('Sample data 14'), 1, SYSTIMESTAMP + INTERVAL '13' MINUTE, 'Emission Trends Report', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1014, UTL_RAW.CAST_TO_RAW('Sample data 15'), 1, SYSTIMESTAMP + INTERVAL '14' MINUTE, 'Air Quality Forecast', 'xlsx'); -- zameni sa docx

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1015, UTL_RAW.CAST_TO_RAW('Sample data 16'), 1, SYSTIMESTAMP + INTERVAL '15' MINUTE, 'Pollution Sources Map', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1016, UTL_RAW.CAST_TO_RAW('Sample data 17'), 1, SYSTIMESTAMP + INTERVAL '16' MINUTE, 'Urban Health Study', 'doc');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1017, UTL_RAW.CAST_TO_RAW('Sample data 18'), 1, SYSTIMESTAMP + INTERVAL '17' MINUTE, 'Traffic Analysis', 'txt');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1018, UTL_RAW.CAST_TO_RAW('Sample data 19'), 1, SYSTIMESTAMP + INTERVAL '18' MINUTE, 'Emission Control Plan', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1019, UTL_RAW.CAST_TO_RAW('Sample data 20'), 1, SYSTIMESTAMP + INTERVAL '19' MINUTE, 'Public Awareness Campaign', 'docx');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1020, UTL_RAW.CAST_TO_RAW('Sample data 21'), 1, SYSTIMESTAMP + INTERVAL '20' MINUTE, 'Cost-Benefit Analysis', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1021, UTL_RAW.CAST_TO_RAW('Sample data 22'), 1, SYSTIMESTAMP + INTERVAL '21' MINUTE, 'Emergency Response Plan', 'docx');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1022, UTL_RAW.CAST_TO_RAW('Sample data 23'), 1, SYSTIMESTAMP + INTERVAL '22' MINUTE, 'Urban Pollution Strategy', 'txt');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1023, UTL_RAW.CAST_TO_RAW('Sample data 24'), 1, SYSTIMESTAMP + INTERVAL '23' MINUTE, 'Emission Reduction Tech', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1024, UTL_RAW.CAST_TO_RAW('Sample data 25'), 1, SYSTIMESTAMP + INTERVAL '24' MINUTE, 'Monitoring Site Photos', 'jpg');

--- TODO                        SVI AKTIVNI FAJLOVI PROJEKAT 1003
--- TODO                        SVI AKTIVNI FAJLOVI PROJEKAT 1001
--- TODO                        SVI AKTIVNI FAJLOVI PROJEKAT 1000


INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1025, UTL_RAW.CAST_TO_RAW('Sample data 26'), 1, SYSTIMESTAMP + INTERVAL '25' MINUTE, 'Air Sampling Data', 'docx');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1026, UTL_RAW.CAST_TO_RAW('Sample data 27'), 1, SYSTIMESTAMP + INTERVAL '26' MINUTE, 'Community Feedback Form', 'txt');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1027, UTL_RAW.CAST_TO_RAW('Sample data 28'), 1, SYSTIMESTAMP + INTERVAL '27' MINUTE, 'Mitigation Implementation Photos', 'png');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1028, UTL_RAW.CAST_TO_RAW('Sample data 29'), 1, SYSTIMESTAMP + INTERVAL '28' MINUTE, 'Final Evaluation Report', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1029, UTL_RAW.CAST_TO_RAW('Sample data 30'), 1, SYSTIMESTAMP + INTERVAL '29' MINUTE, 'Summary Presentation', 'docx');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1030, UTL_RAW.CAST_TO_RAW('Sample data 31'), 1, SYSTIMESTAMP + INTERVAL '30' MINUTE, 'Before & After Photos', 'jpeg');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1031, UTL_RAW.CAST_TO_RAW('Sample data 32'), 1, SYSTIMESTAMP + INTERVAL '31' MINUTE, 'Project Documentation', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1032, UTL_RAW.CAST_TO_RAW('Sample data 33'), 1, SYSTIMESTAMP + INTERVAL '32' MINUTE, 'Annual Progress Report', 'doc');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1033, UTL_RAW.CAST_TO_RAW('Sample data 34'), 1, SYSTIMESTAMP + INTERVAL '33' MINUTE, 'Air Quality Maps', 'bmp');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1034, UTL_RAW.CAST_TO_RAW('Sample data 35'), 1, SYSTIMESTAMP + INTERVAL '34' MINUTE, 'Pollution Source Photos', 'gif');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1035, UTL_RAW.CAST_TO_RAW('Sample data 36'), 1, SYSTIMESTAMP + INTERVAL '35' MINUTE, 'Community Workshop Notes', 'txt');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1036, UTL_RAW.CAST_TO_RAW('Sample data 37'), 1, SYSTIMESTAMP + INTERVAL '36' MINUTE, 'Regulatory Guidelines', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1037, UTL_RAW.CAST_TO_RAW('Sample data 38'), 1, SYSTIMESTAMP + INTERVAL '37' MINUTE, 'Technical Drawings', 'jpg');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1038, UTL_RAW.CAST_TO_RAW('Sample data 39'), 1, SYSTIMESTAMP + INTERVAL '38' MINUTE, 'Installation Photos', 'png');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1039, UTL_RAW.CAST_TO_RAW('Sample data 40'), 1, SYSTIMESTAMP + INTERVAL '39' MINUTE, 'Sensor Calibration Data', 'docx');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1040, UTL_RAW.CAST_TO_RAW('Sample data 41'), 1, SYSTIMESTAMP + INTERVAL '40' MINUTE, 'Final Audit Report', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1041, UTL_RAW.CAST_TO_RAW('Sample data 42'), 1, SYSTIMESTAMP + INTERVAL '41' MINUTE, 'Before-After Comparison', 'jpeg');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1042, UTL_RAW.CAST_TO_RAW('Sample data 43'), 1, SYSTIMESTAMP + INTERVAL '42' MINUTE, 'Project Photos Archive', 'bmp');


-- TODO                         VERZIONISANI FAJLOVI

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1043, UTL_RAW.CAST_TO_RAW('Sample data 1'), 1, SYSTIMESTAMP, 'Emission Report', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1044, UTL_RAW.CAST_TO_RAW('Sample data 2'), 1, SYSTIMESTAMP + INTERVAL '1' MINUTE, 'Air Monitoring Plan', 'docx');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1045, UTL_RAW.CAST_TO_RAW('Sample data 3'), 1, SYSTIMESTAMP + INTERVAL '2' MINUTE, 'Impact Assessment', 'doc');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1046, UTL_RAW.CAST_TO_RAW('Sample data 4'), 1, SYSTIMESTAMP + INTERVAL '3' MINUTE, 'Mitigation Strategies', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1047, UTL_RAW.CAST_TO_RAW('Sample data 5'), 1, SYSTIMESTAMP + INTERVAL '4' MINUTE, 'Implementation Schedule', 'docx');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1048, UTL_RAW.CAST_TO_RAW('Sample data 6'), 1, SYSTIMESTAMP + INTERVAL '5' MINUTE, 'Stakeholder Report', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1049, UTL_RAW.CAST_TO_RAW('Sample data 7'), 1, SYSTIMESTAMP + INTERVAL '6' MINUTE, 'Progress Evaluation', 'docx');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1050, UTL_RAW.CAST_TO_RAW('Sample data 8'), 1, SYSTIMESTAMP + INTERVAL '7' MINUTE, 'Regulatory Compliance', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1051, UTL_RAW.CAST_TO_RAW('Sample data 9'), 1, SYSTIMESTAMP + INTERVAL '8' MINUTE, 'Tech Assessment', 'docx');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1052, UTL_RAW.CAST_TO_RAW('Sample data 10'), 1, SYSTIMESTAMP + INTERVAL '9' MINUTE, 'Public Awareness Plan', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1053, UTL_RAW.CAST_TO_RAW('Sample data 11'), 1, SYSTIMESTAMP + INTERVAL '10' MINUTE, 'Cost-Benefit Analysis', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1054, UTL_RAW.CAST_TO_RAW('Sample data 12'), 1, SYSTIMESTAMP + INTERVAL '11' MINUTE, 'Emergency Response Plan', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1055, UTL_RAW.CAST_TO_RAW('Sample data 8'), 2, SYSTIMESTAMP + INTERVAL '7' MINUTE, 'Regulatory Compliance', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1056, UTL_RAW.CAST_TO_RAW('Sample data 9'), 2, SYSTIMESTAMP + INTERVAL '8' MINUTE, 'Tech Assessment', 'docx');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1057, UTL_RAW.CAST_TO_RAW('Sample data 10'), 2, SYSTIMESTAMP + INTERVAL '9' MINUTE, 'Public Awareness Plan', 'pdf');

INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1058, UTL_RAW.CAST_TO_RAW('Sample data 11'), 2, SYSTIMESTAMP + INTERVAL '10' MINUTE, 'Cost-Benefit Analysis', 'pdf');
INSERT INTO fajl(id, podatak, verzija, datum_kreiranja, naziv, ekstenzija)
VALUES (1059, UTL_RAW.CAST_TO_RAW('Sample data 12'), 2, SYSTIMESTAMP + INTERVAL '11' MINUTE, 'Emergency Response Plan', 'pdf');



---------------------------------------------------------------------------------------------------------------


-- DOKUMENT

---- TODO                       DOKUMENT ZA PROJEKAT 1002 BITAN

-- GLAVNI DOKUMENTI

INSERT INTO dokument(id, projekat_id, naziv, opis, tok_izrade_dokumenta, status, prioritet, roditelj_dokument_id, glavni_fajl_id, vlasnik, rok_zavrsetka,pripremna_verzija)
VALUES (1000, 1002, 'Emission Sources Inventory', 'Lists and categorizes all major sources of air pollution in the urban area.', 1000, 1003, 'visok', NULL, NULL, 1000,TO_DATE('2027-6-15','YYYY-MM-DD'),1);

INSERT INTO dokument(id, projekat_id, naziv, opis, tok_izrade_dokumenta, status, prioritet, roditelj_dokument_id, glavni_fajl_id, vlasnik, rok_zavrsetka,pripremna_verzija)
VALUES (1001, 1002, 'Air Quality Monitoring Plan', 'Defines locations, methods, and frequency of air quality measurements.', 1000, 1004, 'srednji', NULL, NULL, 1000,TO_DATE('2029-6-15','YYYY-MM-DD'),0);

INSERT INTO dokument(id, projekat_id, naziv, opis, tok_izrade_dokumenta, status, prioritet, roditelj_dokument_id, glavni_fajl_id, vlasnik, rok_zavrsetka,pripremna_verzija)
VALUES (1002, 1002, 'Impact Assessment Report', 'Evaluates the effects of current pollution levels on health and the environment.', 1000, 1005, 'mali', NULL, 1002, 1000,TO_DATE('2026-6-15','YYYY-MM-DD'),0);

INSERT INTO dokument(id, projekat_id, naziv, opis, tok_izrade_dokumenta, status, prioritet, roditelj_dokument_id, glavni_fajl_id, vlasnik, rok_zavrsetka,pripremna_verzija)
VALUES (1003, 1002, 'Mitigation Strategies Proposal', 'Suggests actionable measures to reduce emissions and improve air quality.', 1000, 1006, 'visok', NULL, 1003, 1000,TO_DATE('2028-6-15','YYYY-MM-DD'),0);

INSERT INTO dokument(id, projekat_id, naziv, opis, tok_izrade_dokumenta, status, prioritet, roditelj_dokument_id, glavni_fajl_id, vlasnik, rok_zavrsetka,pripremna_verzija)
VALUES (1004, 1002, 'Implementation Schedule', 'Provides a detailed timeline and sequence for executing mitigation actions.', 1001, 1007, 'srednji', NULL, 1004, 1000,TO_DATE('2026-2-15','YYYY-MM-DD'),0);

INSERT INTO dokument(id, projekat_id, naziv, opis, tok_izrade_dokumenta, status, prioritet, roditelj_dokument_id, glavni_fajl_id, vlasnik, rok_zavrsetka,pripremna_verzija)
VALUES (1005, 1002, 'Stakeholder Consultation Report', 'Summarizes feedback and input gathered from community and stakeholders.', 1000, 1008, 'mali', NULL, 1005, 1000,TO_DATE('2026-3-15','YYYY-MM-DD'),0);

INSERT INTO dokument(id, projekat_id, naziv, opis, tok_izrade_dokumenta, status, prioritet, roditelj_dokument_id, glavni_fajl_id, vlasnik, rok_zavrsetka,pripremna_verzija)
VALUES (1006, 1002, 'Progress and Evaluation Reports', 'Tracks progress and measures the effectiveness of implemented strategies.', 1001, 1005, 'visok', NULL, 1006, 1000,TO_DATE('2027-8-15','YYYY-MM-DD'),0);

INSERT INTO dokument(id, projekat_id, naziv, opis, tok_izrade_dokumenta, status, prioritet, roditelj_dokument_id, glavni_fajl_id, vlasnik, rok_zavrsetka,pripremna_verzija)
VALUES (1007, 1002, 'Regulatory Compliance Report', 'Confirms that program activities meet all relevant legal and environmental standards.', 1001, 1006, 'srednji', NULL, 1007, 1000,TO_DATE('2027-9-15','YYYY-MM-DD'),0);


-- PODDOKUMENTI

INSERT INTO dokument(id, projekat_id, naziv, opis, tok_izrade_dokumenta, status, prioritet, roditelj_dokument_id, glavni_fajl_id, vlasnik, rok_zavrsetka,pripremna_verzija)
VALUES (1008, 1002, 'Emission Reduction Technology Assessment', 'Evaluates available technologies and methods to reduce emissions from key sources.', NULL, 1001, 'visok', 1002, 1008, 1001,TO_DATE('2025-11-15','YYYY-MM-DD'),0);

INSERT INTO dokument(id, projekat_id, naziv, opis, tok_izrade_dokumenta, status, prioritet, roditelj_dokument_id, glavni_fajl_id, vlasnik, rok_zavrsetka,pripremna_verzija)
VALUES (1009, 1002, 'Public Awareness Campaign Plan', 'Outlines strategies to inform and engage the public on air quality issues and pollution reduction.', NULL, 1000, 'mali', 1002, NULL, 1001,TO_DATE('2025-12-15','YYYY-MM-DD'),0);

INSERT INTO dokument(id, projekat_id, naziv, opis, tok_izrade_dokumenta, status, prioritet, roditelj_dokument_id, glavni_fajl_id, vlasnik, rok_zavrsetka,pripremna_verzija)
VALUES (1010, 1002, 'Cost-Benefit Analysis Report', 'Analyzes the financial implications and expected benefits of proposed mitigation measures.', NULL, 1002, 'srednji', 1002, 1010, 1006,TO_DATE('2026-1-15','YYYY-MM-DD'),0);

INSERT INTO dokument(id, projekat_id, naziv, opis, tok_izrade_dokumenta, status, prioritet, roditelj_dokument_id, glavni_fajl_id, vlasnik, rok_zavrsetka,pripremna_verzija)
VALUES (1011, 1002, 'Emergency Response Plan', 'Defines procedures to address acute air pollution events and protect public health.', NULL, 1002, 'visok', 1003, 1011, 1006,TO_DATE('2027-6-15','YYYY-MM-DD'),0);




---KORISNIK DOKUMENT

--TODO                  ZA POJEKAT 1002

INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1001, 1000);
INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1001, 1001);
INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1001, 1002);
INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1006, 1002);
INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1001, 1003);
INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1006, 1004);
INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1006, 1005);
INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1006, 1006);
INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1006, 1007);
INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1002, 1002);
INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1005, 1002);
INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1003, 1002);
INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1004, 1002);
INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1005, 1003);
INSERT INTO korisnik_dokument(korisnik_id, dokument_id)
VALUES (1004, 1003);


--DOKUMENT ZAVISNOST

INSERT INTO dokument_zavisnost(dokument_id, zavisi_od)
VALUES (1009, 1008);
INSERT INTO dokument_zavisnost(dokument_id, zavisi_od)
VALUES (1001, 1003);


--DOKUMENT REVIZIJA

INSERT INTO dokument_revizija(id, dokument_id, odobreno, trenutni_status, pregledac_id)
VALUES (1000, 1004, 0, 1006, 1000);
INSERT INTO dokument_revizija(id, dokument_id, odobreno, trenutni_status, pregledac_id)
VALUES (1001, 1005, 0, 1006, 1000);
INSERT INTO dokument_revizija(id, dokument_id, odobreno, trenutni_status, pregledac_id)
VALUES (1002, 1004, 1, 1006, 1000);
INSERT INTO dokument_revizija(id, dokument_id, odobreno, trenutni_status, pregledac_id)
VALUES (1003, 1005, 1, 1006, 1000);


--REVIZIJA IZMENA

INSERT INTO revizija_izmena(id, revizija_id, izmena, ispravljena,datum_ispravljanja)
VALUES (1000, 1000, 'Remove duplicate paragraph in conclusion', 1,SYSTIMESTAMP);
INSERT INTO revizija_izmena(id, revizija_id, izmena, ispravljena,datum_ispravljanja)
VALUES (1001, 1000, 'Adjust table alignment in appendix', 1,SYSTIMESTAMP + INTERVAL '1' DAY);
INSERT INTO revizija_izmena(id, revizija_id, izmena, ispravljena,datum_ispravljanja)
VALUES (1002, 1000, 'Update outdated references', 1,SYSTIMESTAMP + INTERVAL '2' DAY);
INSERT INTO revizija_izmena(id, revizija_id, izmena, ispravljena,datum_ispravljanja)
VALUES (1003, 1001, 'Fix grammatical errors in introduction', 1,SYSTIMESTAMP + INTERVAL '3' DAY);
INSERT INTO revizija_izmena(id, revizija_id, izmena, ispravljena,datum_ispravljanja)
VALUES (1004, 1001, 'Correct title formatting', 1,SYSTIMESTAMP + INTERVAL '4' DAY);


-----------------------------------------------------------------------------------------------------------------

-- AKTIVNI FAJL

-- TODO                 AKTIVNI FAJLOVI PROJEKAT 1002

-- Dokument 1002
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1002, 1002);
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1002, 1016);
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1002, 1010);
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1002, 1024);

-- Dokument 1003
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1003, 1003);
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1003, 1017);
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1003, 1011);

-- Dokument 1004
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1004, 1004);
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1004, 1018);
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1004, 1000);

-- Dokument 1005
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1005, 1005);
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1005, 1019);
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1005, 1001);

-- Dokument 1006
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1006, 1006);
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1006, 1020);
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1006, 1009);

-- Dokument 1007
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1007, 1007);
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1007, 1021);

-- Dokument 1008
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1008, 1008);
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1008, 1022);

-- Dokument 1010
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1010, 1010);
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1010, 1024);

-- Dokument 1011
INSERT INTO dokument_aktivni_fajl(dokument_id, fajl_id) VALUES (1011, 1011);

-- TODO                     SVI FAJLOVI PROJEKTA 1002

-- Dokument 1002
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1002, 1002);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1002, 1016);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1002, 1010);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1002, 1024);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1011, 1045);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1011, 1053);


-- Dokument 1003
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1003, 1003);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1003, 1017);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1003, 1011);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1011, 1046);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1011, 1054);


-- Dokument 1004
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1004, 1004);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1004, 1018);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1004, 1000);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1011, 1043);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1011, 1047);


-- Dokument 1005
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1005, 1005);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1005, 1019);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1005, 1001);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1011, 1044);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1011, 1048);


-- Dokument 1006
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1006, 1006);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1006, 1020);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1006, 1009);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1011, 1049);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1011, 1052);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1011, 1057);

-- Dokument 1007
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1007, 1007);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1007, 1021);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1011, 1050);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1011, 1055);

-- Dokument 1008
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1008, 1008);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1008, 1022);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1011, 1051);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1011, 1056);
-- Dokument 1010
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1010, 1010);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1010, 1024);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1011, 1058);

-- Dokument 1011
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1011, 1011);
INSERT INTO dokument_fajl(dokument_id, fajl_id) VALUES (1011, 1059);

--------------------------------------------------------------------------------------------------

-- OBAVESTENJA

INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1000, 'Dokument zavrsen', 1, 0, 1004);
INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1001, 'Dokument zavrsen', 1, 0, 1005);
INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1002, 'Dokument zavrsen', 7, 0, 1010);
INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1003, 'Dokument zavrsen', 7, 0, 1011);
INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1004, 'Dokument zahteva reviziju', 1, 1, 1004);
INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1005, 'Dokument zahteva reviziju', 1, 1, 1005);
INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1006, 'Dokument zahteva reviziju', 1, 1, 1004);
INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1007, 'Dokument zahteva reviziju', 1, 1, 1005);
INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1008, 'Dokument zahteva reviziju', 1, 0, 1003);
INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1009, 'Dokument zahteva reviziju', 1, 0, 1007);
INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1010, 'Dokument je odbijen', 7, 1, 1004);
INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1011, 'Dokument je odbijen', 7, 1, 1005);
INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1012, 'Dokument je odobren', 7, 1, 1004);
INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1013, 'Dokument je odobren', 7, 1, 1005);

INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1014, 'Dodeljen ti je novi dokument', 2, 0, 1000);

INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1015, 'Dodeljen ti je novi dokument', 2, 0, 1001);

INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1016, 'Dodeljen ti je novi dokument', 2, 0, 1002);

INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1017, 'Dodeljen ti je novi dokument', 7, 0, 1002);

INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1018, 'Dodeljen ti je novi dokument', 2, 0, 1003);

INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1019, 'Dodeljen ti je novi dokument', 7, 0, 1004);

INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1020, 'Dodeljen ti je novi dokument', 7, 0, 1005);

INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1021, 'Dodeljen ti je novi dokument', 7, 0, 1006);

INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1022, 'Dodeljen ti je novi dokument', 7, 0, 1007);

INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1023, 'Dodeljen ti je novi dokument', 3, 0, 1002);

INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1024, 'Dodeljen ti je novi dokument', 6, 0, 1002);

INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1025, 'Dodeljen ti je novi dokument', 4, 0, 1002);

INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1026, 'Dodeljen ti je novi dokument', 5, 0, 1002);

INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1027, 'Dodeljen ti je novi dokument', 6, 0, 1003);

INSERT INTO obavestenje(id, poruka, korisnik_id, procitana, dokument_id)
VALUES (1028, 'Dodeljen ti je novi dokument', 5, 0, 1003);

