feche a iniciativa connector-configuration-write-upsert-hotfix e comite tudo

A tarefa corretiva única (writeConnectorConfigurations upsert-by-identity) foi implementada,
provada (suíte verde, 144 arquivos, 1683 testes) e revisada por /review-change. Dois achados do
review (cobertura parcial do critério 2, e um teste rotulado como "inference" um fato que a
especificação já declara) foram tratados por uma reentrega proof-only, também com suíte verde.
Dois achados de standard (STK-08, MNT-03) do mesmo review ficam deliberadamente em aberto —
cosméticos, fora do escopo deste incremento corretivo. O trabalho da iniciativa está feito.
