DELIMITER //

-- tb_main_action_log
DROP TRIGGER IF EXISTS trig_on_action_log_before_insert;
CREATE TRIGGER trig_on_action_log_before_insert BEFORE INSERT ON tb_main_action_log FOR EACH ROW
BEGIN
  DECLARE maxSeq INT;
  SELECT
    IFNULL(MAX(seq), 0) INTO maxSeq
  FROM tb_main_action_log;
  SET NEW.seq = maxSeq + 1;
END;

-- tb_main_auth
DROP TRIGGER IF EXISTS trig_on_auth_before_insert;
CREATE TRIGGER trig_on_auth_before_insert BEFORE INSERT ON tb_main_auth FOR EACH ROW
BEGIN
  DECLARE maxSeq INT;
  SELECT
    IFNULL(MAX(seq), 0) INTO maxSeq
  FROM tb_main_auth;
  SET NEW.seq = maxSeq + 1;
END;

-- tb_main_muser
DROP TRIGGER IF EXISTS trig_on_muser_before_insert;
CREATE TRIGGER trig_on_muser_before_insert BEFORE INSERT ON tb_main_muser FOR EACH ROW
BEGIN
  DECLARE maxSeq INT;
  SELECT
    IFNULL(MAX(seq), 0) INTO maxSeq
  FROM tb_main_muser;
  SET NEW.seq = maxSeq + 1;
END;

-- tb_main_sys_menu
DROP TRIGGER IF EXISTS trig_on_sys_menu_before_insert;
CREATE TRIGGER trig_on_sys_menu_before_insert BEFORE INSERT ON tb_main_sys_menu FOR EACH ROW
BEGIN
  DECLARE maxSeq INT;
  SELECT
    IFNULL(MAX(seq), 0) INTO maxSeq
  FROM tb_main_sys_menu;
  SET NEW.seq = maxSeq + 1;
END;

-- tb_main_user
DROP TRIGGER IF EXISTS trig_on_user_before_insert;
CREATE TRIGGER trig_on_user_before_insert BEFORE INSERT ON tb_main_user FOR EACH ROW
BEGIN
  DECLARE maxSeq INT;
  SELECT
    IFNULL(MAX(seq), 0) INTO maxSeq
  FROM tb_main_user;
  SET NEW.seq = maxSeq + 1;
END;

-- tb_main_fund
DROP TRIGGER IF EXISTS trig_on_fund_before_insert;
CREATE TRIGGER trig_on_fund_before_insert BEFORE INSERT ON tb_main_fund FOR EACH ROW
BEGIN
  DECLARE maxSeq INT;
  SELECT
    IFNULL(MAX(seq), 0) INTO maxSeq
  FROM tb_main_fund;
  SET NEW.seq = maxSeq + 1;
END;

-- tb_main_stock
DROP TRIGGER IF EXISTS trig_on_stock_before_insert;
CREATE TRIGGER trig_on_stock_before_insert BEFORE INSERT ON tb_main_stock FOR EACH ROW
BEGIN
  DECLARE maxSeq INT;
  SELECT
    IFNULL(MAX(seq), 0) INTO maxSeq
  FROM tb_main_stock;
  SET NEW.seq = maxSeq + 1;
END;

//
