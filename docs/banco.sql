//CREATE DATABASE controledeestoque;

CREATE TABLE itens (
    id         SERIAL PRIMARY KEY,
    nome       VARCHAR(100) NOT NULL,
    categoria      VARCHAR(50)  NOT NULL,
    valorunit     DECIMAL(10,2) NOT NULL,
    quant    INTEGER DEFAULT 0
);

INSERT INTO itens (nome, categoria, valorunit, quant) VALUES
    ('Vassoura',        	 'Ferramenta',      15.00, 50),
    ('Saco de Lixo',         'Utilidade',      5.00, 30),
    ('Água Sanitária',       'Utilidade', 	8.50, 15),
    ('Pano',           		 'Utilidade', 	5.00, 40),
    ('Esfregão',  			 'Ferramenta',     20.00, 10),
    ('Balde',      			 'Ferramenta',	12.00, 25),
    ('Sabão',				 'Utilidade',    6.00,  8);
	
SELECT * FROM itens;
	
	