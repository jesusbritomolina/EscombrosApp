ALTER TABLE payments
ADD UNIQUE INDEX `unique_userId_semana_id` (UserId, semana_id);
--

CREATE TRIGGER calls_before_insert
BEFORE INSERT ON calls
FOR EACH ROW
BEGIN
  SET NEW.createdAt = NOW();
  SET NEW.updatedAt = NOW();
  SET NEW.totalCalls = NEW.calls1stCut + NEW.calls2ndCut + NEW.callsFinalCut;
  SET NEW.totalAmount = NEW.firstCut + NEW.secondCut + NEW.finalCut;
END;
--

CREATE TRIGGER calls_before_update
BEFORE UPDATE ON calls
FOR EACH ROW
BEGIN
  SET NEW.updatedAt = NOW();
  SET NEW.totalCalls = NEW.calls1stCut + NEW.calls2ndCut + NEW.callsFinalCut;
  SET NEW.totalAmount = NEW.firstCut + NEW.secondCut + NEW.finalCut;
END;
--

CREATE TRIGGER payments_after_insert
AFTER INSERT ON calls
FOR EACH ROW
BEGIN
  DECLARE user_id INT DEFAULT (SELECT UserId FROM phones WHERE id = NEW.telefono_id);
  DECLARE total_calls_sum INT;
  DECLARE total_amount_sum DECIMAL(10, 2);
  DECLARE existing_payment_id INT;

  SELECT
      SUM(totalCalls),
      SUM(totalAmount)
  INTO total_calls_sum, total_amount_sum
  FROM calls
  WHERE telefono_id IN (SELECT id FROM phones WHERE UserId = user_id) AND semana_id = NEW.semana_id;

  SELECT id INTO existing_payment_id FROM payments WHERE UserId = user_id AND semana_id = NEW.semana_id;

  IF existing_payment_id IS NULL THEN
    INSERT INTO payments (UserId, semana_id, totalCallsSum, totalAmountSum, createdAt, updatedAt)
    VALUES (user_id, NEW.semana_id, total_calls_sum, total_amount_sum, NOW(), NOW());
  ELSE
    UPDATE payments
    SET totalCallsSum = total_calls_sum, totalAmountSum = total_amount_sum, updatedAt = NOW()
    WHERE id = existing_payment_id;
  END IF;
END;
--

CREATE TRIGGER payments_after_update
AFTER UPDATE ON calls
FOR EACH ROW
BEGIN
  DECLARE user_id INT DEFAULT (SELECT UserId FROM phones WHERE id = NEW.telefono_id);
  DECLARE total_calls_sum INT;
  DECLARE total_amount_sum DECIMAL(10, 2);
  DECLARE existing_payment_id INT;

  SELECT
      SUM(totalCalls),
      SUM(totalAmount)
  INTO total_calls_sum, total_amount_sum
  FROM calls
  WHERE telefono_id IN (SELECT id FROM phones WHERE UserId = user_id) AND semana_id = NEW.semana_id;

  SELECT id INTO existing_payment_id FROM payments WHERE UserId = user_id AND semana_id = NEW.semana_id;

  IF existing_payment_id IS NULL THEN
    INSERT INTO payments (UserId, semana_id, totalCallsSum, totalAmountSum, createdAt, updatedAt)
    VALUES (user_id, NEW.semana_id, total_calls_sum, total_amount_sum, NOW(), NOW());
  ELSE
    UPDATE payments
    SET totalCallsSum = total_calls_sum, totalAmountSum = total_amount_sum, updatedAt = NOW()
    WHERE id = existing_payment_id;
  END IF;
END;
--

CREATE TRIGGER payments_after_delete
AFTER DELETE ON calls
FOR EACH ROW
BEGIN
  DECLARE user_id INT DEFAULT (SELECT UserId FROM phones WHERE id = OLD.telefono_id);
  DECLARE total_calls_sum INT;
  DECLARE total_amount_sum DECIMAL(10, 2);
  DECLARE existing_payment_id INT;
  DECLARE remaining_calls INT;

  SELECT
      SUM(totalCalls),
      SUM(totalAmount)
  INTO total_calls_sum, total_amount_sum
  FROM calls
  WHERE telefono_id IN (SELECT id FROM phones WHERE UserId = user_id) AND semana_id = OLD.semana_id;

  SELECT id INTO existing_payment_id FROM payments WHERE UserId = user_id AND semana_id = OLD.semana_id;

  SELECT COUNT(*) INTO remaining_calls FROM calls WHERE telefono_id IN (SELECT id FROM phones WHERE UserId = user_id) AND semana_id = OLD.semana_id;

  IF existing_payment_id IS NULL THEN
    INSERT INTO payments (UserId, semana_id, totalCallsSum, totalAmountSum, createdAt, updatedAt)
    VALUES (user_id, OLD.semana_id, total_calls_sum, total_amount_sum, NOW(), NOW());
  ELSE
    UPDATE payments
    SET totalCallsSum = total_calls_sum, totalAmountSum = total_amount_sum, updatedAt = NOW()
    WHERE id = existing_payment_id;
  END IF;
END;
--

CREATE TRIGGER create_calls_for_new_week 
AFTER INSERT ON weeks
FOR EACH ROW
BEGIN
  DECLARE cur_telefono_id INT; 
  DECLARE done INT DEFAULT 0;
  DECLARE cur CURSOR FOR SELECT id FROM phones WHERE isActive = 1;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;        

  OPEN cur;

  calls_loop: LOOP
    FETCH cur INTO cur_telefono_id;

    IF done = 1 THEN
      LEAVE calls_loop;        
    END IF;

    INSERT INTO calls (        
      telefono_id,
      semana_id,
      calls1stCut,
      firstCut,
      calls2ndCut,
      secondCut,
      callsFinalCut,
      finalCut,
      totalCalls,
      totalAmount,
      createdAt,
      updatedAt
    ) VALUES (
      cur_telefono_id,
      NEW.id,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      NOW(),
      NOW()
    );
  END LOOP calls_loop;
  CLOSE cur;
END;
--
