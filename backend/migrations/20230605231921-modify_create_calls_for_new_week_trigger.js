'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS create_calls_for_new_week;
    `);

    await queryInterface.sequelize.query(`
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
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS create_calls_for_new_week;
    `);

    // Aquí, recreamos el trigger original sin considerar la columna isActive.
    await queryInterface.sequelize.query(`
      CREATE TRIGGER create_calls_for_new_week 
      AFTER INSERT ON weeks
      FOR EACH ROW
      BEGIN
        DECLARE cur_telefono_id INT; 
        DECLARE done INT DEFAULT 0;
        DECLARE cur CURSOR FOR SELECT id FROM phones;
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
    `);
  }
};
