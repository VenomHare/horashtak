- Refer @spec/13-calculation-changes-implementation.md

# The hora table calculation needs serious changes
- I want you change the calculation in such way 
    1. ignore rahu ketu and calculate the whole hora table according to sunrise time
    2. once we have the table, app checks if rahu ketu flag is enabled
        - if true, we change ending of mangal by 12 mins and starting time of Ravi by 12 mins in between that 24 mins will be rahu.
        - same for ketu, we change ending of shani by 12 mins and starting time of Guru by 12 mins in between that 24 mins will be ketu.
        - if not enabled we completely ignore the part never show user those both
        

# Widget 
- widget isn't functional any more. i dont see any thing but a card 