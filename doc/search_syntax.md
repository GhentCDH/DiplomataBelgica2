# Dibe search syntax

## Elastic documentation

- [regexp query](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-regexp-query.html)
- [interval query](https://www.elastic.co/guide/en/elasticsearch/reference/8.2/query-dsl-intervals-query.html)

## Syntax

### . : WILDCARD REPLACING 1 CHARACTER
Example: “g.nterus” will retrieve “gunterus” and “gonterus”



### * : WILDCARD REPLACING 0, 1 OR MORE CHARACTER
  Example: “flandr*” will retrieve “flandras”, “flandrensis”, “flandris”, “flandrense”, etc.

Example: “*episc*” will retrieve “episcopus”, “archiepiscopus”, “episcoporum”, “archiepiscoporum”, etc.



Entering two or more wordforms separated by a blank space will result in the occurrences of these words in this specific order. The use of the wildcards . or * remains possible.

Example: “in nomine patris” will only retrieve the occurrences of “in nomine patris”.

Example: “pro anim*” will retrieve the occurrences of “pro anima”, “pro anime”, “pro animabus”, etc.

### + : BOOLEAN AND OPERATOR

Example: “comes + imperator” will retrieve all documents containing both “comes” and “imperator”, regardless the order in which they occur. The + operator can also be used to search for more than two wordforms and can be combined with the . and * wildcards.



### , : BOOLEAN OR OPERATOR

Example: “comes, imperator” will retrieve all documents containing only “comes”, only “imperator” or both “comes” and “imperator”. The , operator can also be used to search for more than two wordforms and can be combined with the . and * wildcards.



### # : BOOLEAN NOT OPERATOR

Preceding a wordform with # implies that documents containing this wordform will not be selected. The # operator can be combined with the + operator and with the . and * wildcards.

Example: “comes + dux + #imperator*” will retrieve all documents containing both “comes” and “dux”, regardless the order in which they occur, but not containing “imperator”, imperatorem”, “imperatoris” etc.


### PARENTHESES
The use of parentheses makes it possible to combine the use of different Boolean operators.

Example: “(comes + dux), imperator” will retrieve documents containing “imperator” or the co-occurrence of “comes” and “dux”, or both “imperator” and the co-occurrence of “comes” and “dux”.

Example: “(comes, imperator) + deus” will retrieve documents containing “deus” and either the co-occurrence of “comes” and “imperator” or the occurrence of only one of the two latter wordforms.

Example: “#(imperator, deus)” will retrieve documents that do not contain either “imperator” or “deus” or the combination of both “imperator” and “deus”.

### /N(ABC; DEF; GHI) : SEARCH FOR DIFFERENT WORDFORMS WITHIN A SPECIFIC RANGE OF N WORDS, REGARDLESS THE ORDER IN WHICH THEY OCCUR
Example: “/15(sciant; futuri; presentes)” will retrieve all documents containing the wordforms “sciant”, “futuri” and “presentes” within a range of 15 words, regardless the order in which they occur.
Wordforms should be separated by semicolons and put between parentheses. There is no limit on the number of wordforms that can be searched. It is possible to combine such a query with the use of the wildcards . and *. The use of Boolean operators is not possible between the parentheses used to define such queries.


### %N(ABC; DEF; GHI) : SEARCH FOR DIFFERENT WORDFORMS, OCCURRING IN A SPECIFIC ORDER, WITHIN A SPECIFIC RANGE OF N WORDS
Example: “%15(sciant; futuri; presentes)” will retrieve all documents containing the wordforms “sciant”, “futuri” and “presentes”, in this specific order, within a range of 15 words.
Wordforms should be separated by semicolons and put between parentheses. There is no limit on the number of wordforms that can be searched. It is possible to combine such a query with the use of the wildcards . and *. The use of Boolean operators is not possible between the parentheses used to define such queries.



Queries of different wordforms (ordered or not) within a specific range of words can be combined with other queries by using Boolean operators and parentheses. This allows for very complex queries.

Example: “%15(sciant; futuri; presentes) + (imperator*, comit*) + #*episc*”.



### GENERAL REMARKS

- searching for wordforms is case-insensitive
- wildcards will never consider blank spaces
- unnecessary blank spaces in a search string will never influence the search result
