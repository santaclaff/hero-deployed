//=============================================================================
// TAA_EnemyLevels.js
// Author: taaspider
//=============================================================================

var TAA = TAA || {};
TAA.el = {};
TAA.el.Version = "1.2.1";
TAA.el.PluginName = "TAA_EnemyLevels";
TAA.el.alias = {};

/*:
 * @target MV MZ
 * 
 * @plugindesc [1.2.1] Give Enemies their own levels
 * @author T. A. A. (taaspider)
 * @url http://taaspider.itch.io/ 
 * 
 * @help
 * ============================================================================
 * Terms of Use
 * ============================================================================
 * Any plugins developed by taaspider are free for use for both commercial and 
 * noncommercial RPG Maker games, unless specified otherwise. Just remember to
 * credit "Taaspider".
 * 
 * Redistribution of parts or the whole of taaspider plugins is forbidden, unless
 * it comes from the official website: http://taaspider.itch.io. You are allowed 
 * to edit and change the plugin code for your own use, but you're definitely not 
 * allowed to sell or reuse any part of the code as your own. Although not 
 * required to use my plugins, a free copy of your game would be nice!
 * 
 * If you enjoy my work, consider offering a donation when downloading my plugins, 
 * or offering a monthly pledge to my Patreon account. It would be of great help!
 * Also, follow me on facebook to get firsthand news on my activities!
 *  Facebook: https://www.facebook.com/taaspider 
 *  Patreon: https://www.patreon.com/taaspider
 * 
 * =============================================================================
 * Introduction
 * =============================================================================
 * 
 * WARNING: This plugin requires RPG Maker MV 1.5.0 or above! Please make sure 
 * your RPG Maker MV software is up to date before using this plugin.
 * You don't need any specific version if you're using MZ.
 * 
 * -----------------------------------------------------------------------------
 * 
 * This plugin goal is to provide enemies their own leveling system. It allows enemy 
 * levels to change as the party levels, customize levels on specific maps, create a
 * base level that affects leveling throughout the whole game (so you can create an
 * item, for example, that increases difficulty by increasing all enemy levels), and
 * change enemy sprites according to its level.
 * 
 * The plugin also provides experience and gold modifiers that can customize even
 * further how enemy levels affect your game progress.
 * 
 * =============================================================================
 * Instructions - Level Priority
 * =============================================================================
 * 
 * Enemy levels are set using three different layers, where only one is actually
 * applied at enemy initialization. Those three are:
 *  1st - Map specific levels
 *      Use map note tags to specify enemy levels in that map. This affects both
 *      random encounters and event triggered battles;
 *  2nd - Level from variables
 *      If there is no map level rule present for a given enemy, the plugin will
 *      check the level range variables. If configured and their value is greater
 *      than zero, a random level between the lower and upper range variables will
 *      be set;
 *  3rd - Level from dynamic rule
 *      Within the plugins parameters you can select a dynamic level rule, which
 *      is applied if none of the other layers are present. There are three possible
 *      rules so far:
 *          1) Party lowest level
 *              The plugin will generate a random level (given the negative and
 *              positive range values) centered around the battle member with
 *              the lowest level. For example, if the lowest level among party
 *              battle members is 5 and both positive and negative range is
 *              set as 2, the enemy level can be any number between 3 and 7;
 *          2) Party average level
 *              The random level is generated using the battle members average
 *              level as a starting point;
 *          3) Party highest level
 *              The random level is generated using the battle member with the
 *              highest level as a starting point;
 * 
 * 
 * =============================================================================
 * Level Variables
 * =============================================================================
 * 
 * Manual Lower Level
 *  Select a variable to use when setting a lower range value for enemy levels.
 *  If both this variable and Manual Upper Level are set, a random value between
 *  the values from both variables is generated and used as the enemy level
 *  (only if there is no map specific levels defined).
 * 
 * Manual Upper Level
 *  Select a variable to use when setting a upper range value for enemy levels.
 *  If both this variable and Manual Lower Level are set, a random value between
 *  the values from both variables is generated and used as the enemy level
 *  (only if there is no map specific levels defined).
 * 
 * Level Modifier
 *  Select a variable to use as a base level modifier. This value is added to any
 *  calculated enemy level, from any layer. This way you can increase/decrease the
 *  game difficulty by adjusting enemy levels globally.
 * 
 * 
 * =============================================================================
 * DataSource Config
 * =============================================================================
 * 
 * Parameter formulas can be defined for each enemy using three different methods:
 * an external JSON file, using Plugin Parameters, and through enemy note tags.
 * You can use both a JSON file and Plugin Parameters at the same time, so you
 * need to choose one through the parameter "SourceType". 
 * 
 * Note tags an be used regardless of which one of the two you choose, and has a 
 * higher priority than both. That means if an enemy have its formulas set in a
 * JSON file, for example, but also have note tags, the note tags will overwrite
 * whatever is loaded from the file.
 * 
 * If none of the three methods are specified, the default formulas set through
 * plugin parameters are used.
 * 
 * OBS.: The JSON file can be shared with other plugins from the TAA library, so
 * you can concentrate all enemy config data in one place.
 * 
 * -----------------------------------------------------------------------------
 * JSON Config
 * -----------------------------------------------------------------------------
 * 
 * File
 *  - This should point to a JSON file containing your enemy level data. The file
 * must be place inside your game's data folder.
 * The JSON file must have a structure similar to this:
 *  [
 *      {
 *          "id": <enemy ID>,
 *          "class": <class ID>,
 *          "mhp": "max HP formula",
 *          "mmp": "max MP formula",
 *          "atk": "attack formula",
 *          "def": "defense formula",
 *          "mat": "magic attack formula",
 *          "mdf": "magic defense formula",
 *          "agi": "agility formula",
 *          "luk": "luck formula",
 *          "exp": "experience formula",
 *          "gold": "gold formula",
 *          "showLevel": true|false,
 *          "preserveStats": true|false,
 *          "resist": <resistance percentage>,
 *          "traits": [
 *              "<trait clause>",
 *              ...
 *          ]
 *      }
 *  ]
 * 
 * You can customize the object's tags as you wish using the next parameters.
 * 
 * IMPORTANT: 
 *  - <enemy ID> must be a valid enemy ID in the database, and must be unique in
 * your JSON file. More than one entry for the same id can (and will) generate 
 * errors.
 *  - <resistance percentage> should be a value between 0 and 100. 0 means the 
 * enemy has no chance of avoiding a level change skill, whereas a value of 100
 * means it will always resist a level change. Any value between indicates how
 * likely it is to resist the change.
 *  - <class ID> is an optional parameter. If present, enemy stats will be based 
 * on the specified class stats, including experience, which will be based on the
 * class experience curve. However, experience can be customized setting the "exp"
 * formula. Gold must still have its own formula (even if it is the default one),
 * and parameters cannot be customized outside of the class when it is set. Also,
 * when using class based parameters the enemy will inherit class traits, although
 * enemy specific traits will take precedence.
 * If you wish to use formulas instead of class based parameters, simply omit the
 * class object, or set it to 0.
 *  - "traits" is another optional array included on version 1.2.0. You can include
 * one or more <trait clauses> in the array as described in the Traits section
 * below.
 * 
 * -----------------------------------------------------------------------------
 * Plugin Manager Data
 * -----------------------------------------------------------------------------
 * 
 * Setting up enemy level data through Plugin Parameters is pretty straightforward,
 * just make sure there is only one entry for each enemy ID.
 * 
 * As of version 1.2.0 or higher, there's a new parameter called "Class". When it is
 * set to a valid class ID, all enemy stats will be based on the class parameter
 * curves, including experience, which will be based on the class experience curve. 
 * However, experience can be customized setting the "exp" formula. Gold must still 
 * have its own formula (even if it is the default one), and parameters cannot be 
 * customized outside of the class when it is set. Also, when using class based 
 * parameters the enemy will inherit class traits, although enemy specific traits 
 * will take precedence.
 * If you wish to use formulas instead of class based parameters, simply set the 
 * class parameter to 0.
 * 
 * There is also a new parameter called "Traits", which allow custom traits based
 * on enemy level. Read more on this new feature in the following section.
 * 
 * -----------------------------------------------------------------------------
 * Traits
 * -----------------------------------------------------------------------------
 * 
 * Starting on version 1.2.0, enemies can have new traits based on their level
 * (for example, having a higher level enemy with a higher critical rate than a
 * low level one).
 * 
 * Configuring level based traits is pretty much the same with Json or Plugin 
 * Manager based settings. Each trait clause can be used to set a specific trait,
 * but all clauses start with the minimum level the enemy must have for that trait
 * to take effect:
 *  LEVEL <lvl>: <trait clause>
 * 
 * <lvl> identifies when that trait clause starts to be considered. That is, it
 * will only take effect when the enemy level is greater or equal to <lvl>
 * 
 * Trait clauses are also not stackable. That means that if your enemy have, for
 * example, a trait for 2% evasion by default, and you add a trait clause for 4%
 * at level 3, all enemies units with level greater or equal to 3 will have its
 * original trait replaced by the new one. That is the new evasion stats becomes 
 * 4% and not 6%. That also ensures you don't need (and shouldn't) repeat all 
 * traits for all levels. Just set what must change and at what level and you're
 * good to go.
 * 
 * See a full explanation for all available trait clauses below.
 * 
 * Elemental rate
 *  LEVEL <lvl>: ELEMENT RATE <element Id> <rate>
 *      Adds an element rate to the enemy. <element Id> represents the element 
 *      being set, and rate is a percentage to apply (with 0 being its minimum
 *      value, but with no upper threshold).
 *      Adding a second element rate won't overwrite the first when they have 
 *      different elements. But if you include a new trait clause for the same 
 *      element at another level, then the first one will get overwritten.
 * 
 *  LEVEL <lvl>: DEBUFF RATE <stat> <rate>
 *      Adds a debuff rate to the enemy. <stat> represents which stat to debuff
 *          MHP for Max HP
 *          MMP for Max MP
 *          ATK for Attack
 *          DEF for Defense
 *          MAT for Magical Attack
 *          MDF for Magical Defense
 *          AGI for Agility
 *          LUK for Luck
 *      Rate is also a percentage (with 0 being its minimum value and no upper
 *      threshold).
 *      Adding a second debuff rate won't overwrite the first if the stat is
 *      different. But it does when you set the same stat debuff a second time.
 * 
 *  LEVEL <lvl>: STATE RATE <state Id> <rate>
 *      Adds a state rate to the enemy. <state Id> must be a valid state ID, while
 *      rate is a percentage and works the same way as with the other clauses.
 *      Adding a second state rate won't overwrite the first if it is a different
 *      state, only if it's the same.
 * 
 *  LEVEL <lvl>: STATE RESIST <state Id>
 *      Adds a state immunity to the enemy, identified by <state Id>.
 *      State resistances can only be added as the level grows, never taken out.
 * 
 *  LEVEL <lvl>: EX PARAM <param> <value>
 *      This clause allows you to change the following Ex-Parameters, identified by
 *      <param>:
 *          HIT for Hit Rate
 *          EVA for Evation Rate
 *          CRI for Critical Rate
 *          CEV for Critical Evasion Rate
 *          MEV for Magic Evasion Rate
 *          MRF for Magic Reflection Rate
 *          CNT for Counter Attack Rate
 *          HRG for HP Regeneration Rate
 *          MRG for MP Regeneration Rate
 *          TRG for TP Regeneration Rate
 *      <value> is a percentage value added to the enemy base stats (the same way
 *      it works when setting it through the editor).
 *      Adding a second param setting won't overwrite the first if a different param
 *      is set, only if it's the same param.
 * 
 *  LEVEL <lvl>: SP PARAM <param> <rate>
 *      This clause allows you to change the following Sp-Parameters, identified by
 *      <param>:
 *          TRG for Target Rate
 *          GRD for Guard Effect Rate
 *          REC for Recovery Effect Rate
 *          PHA for Pharmacology Rate
 *          MCR for MP Cost Rate
 *          TCR for TP Cost Rate
 *          PDR for Physical Damage Rate
 *          MDR for Magical Damage Rate
 *      Rate is also a percentage (with 0 being its minimum value and no upper
 *      threshold).
 *      Adding a second param setting won't overwrite the first if a different param
 *      is set, only if it's the same param.
 * 
 *  LEVEL <lvl>: ATK ELEMENT <element Id>
 *      Adds an element identified by <element Id> to the enemy's attacks.
 *      Attack elements can only be added as the level grows, never taken out.
 * 
 *  LEVEL <lvl>: ATK STATE <state Id> <rate>
 *      Adds a state rate to the enemy's attacks. <state Id> identifies which state
 *      to apply, and <rate> works as with the other clauses.
 *      Adding a second state rate won't overwrite the first if it is a different
 *      state, only if it's the same.
 * 
 *  LEVEL <lvl>: ATK SPEED <speed>
 *      Changes the attack speed setting for the enemy.
 *      Adding a second clause will always overwrite the first.
 * 
 *  LEVEL <lvl>: ATK TIMES <number>
 *      Changes how many additional attacks the enemy will have per turn.
 *      Adding a second clause will always overwrite the first.
 * 
 * WARNING: Trait clauses must be ordered by level to work properly. Unordered
 * clauses may not work as intended.
 *  
 * =============================================================================
 * Parameter formulas
 * =============================================================================
 * 
 * You're pretty much free to build your own formula as you like. The following 
 * variables can be used to enrich them:
 *  level = is replaced by the enemy current level
 *  base = is replaced by the parameter base value (the one configured in the editor)
 *  v[n] = is replaced by the variable of number n value
 *  s[n] = is replaced by the switch of number n value (true or false)
 * 
 * =============================================================================
 * Global Configs
 * =============================================================================
 * 
 * Show Enemy Level
 *  This defines if an enemy level must be shown at the battle windows alongside its
 *  name, or not.
 * 
 * Enemy Name Display
 *  This can be used to customize how the enemy name is displayed when Show Enemy Level
 *  is enabled. There are three special escape codes available:
 *      %1 is replaced by the enemy name
 *      %2 is replaced by the enemy level
 *      %3 is replaced by the enemy letter (when present)
 * 
 * Preserve Stats
 *  This defines if Max HP and Max MP must be preserved after a level change is forced
 *  by a skill. If enabled, the original values for these two parameters are kept, but 
 *  all others are updated. If disabled, they will both be updated alongside the others.
 *  This is a default setting, which can be customized for each enemy.
 * 
 * Resist Level Change
 *  This defines a default level of resistance, which is applied to all enemies that
 *  don't have their specific resistance set.
 * 
 * =============================================================================
 * Modifiers
 * =============================================================================
 * 
 * Experience Distribution Modifier
 *  This modifier affects how experience is distributed to party members at the end
 *  of a battle. Its possible settings are:
 *      None
 *          Don't apply any modifiers, keep the engine's default.
 *      Divide by Alive Members
 *          The experience earned is divided to all members still alive at the end
 *          of a battle. For example, if 400 exp has been earned and there are four
 *          alive actors in a party, each will receive 100.
 *          KOed members don't receive any experience.
 *      Divide by All Members
 *          The experience earned is divided to all members, regardless of him
 *          being alive at the end of the battle or not.
 *      Same to Alive Members
 *          The total amount of experience earned at the end of a battle is given
 *          to all alive members. For example, if 400 exp has been earned and there 
 *          are four alive actors in a party, each will receive 400.
 *      Same to All Members
 *          The total amount of experience earned at the end of a battle is given
 *          to all battle members.
 * 
 * Experience Value Modifier
 *  This affects the experience earned at the end of a battle. Its possible settings
 *  are:
 *      None
 *          Don't apply any modifiers.
 *      Proportional to Mob Size
 *          Modify the total amount of experience earned according to the mob size.
 *          The plugin engine will add an extra 10% for each enemy defeated.
 *      Proportional to Average Levels
 *          Modify the total amount of experience earned considering how troop and
 *          party average levels relate to each other. If troop average level is
 *          lower than the party average level, the amount of experience is
 *          reduced by the same rate (troop level / party level), and if troop
 *          average level is greater than party level the amount of experience
 *          is increased by the same rate.
 *      Proportional to Lowest Levels
 *          Modify the total amount of experience earned proportionally to both troop
 *          and party lowest levels. The higher the difference between levels, the 
 *          greater the impact in the final value.
 *      Proportional to Highest Levels
 *          Modify the total amount of experience earned proportionally to both troop
 *          and party highest levels. The higher the difference between levels, the
 *          greater the impact in the final value.
 *      Proportional to Exact Levels
 *          Experience earned is calculated individually for each actor, and the 
 *          modifier is applied to each enemy defeated. For example, if an actor of
 *          level 10 defeated three enemies with levels 5, 10 and 15, the experience
 *          gained from the first is diminished, for having a lower level than the 
 *          actor, the second has no change and the third is increased for having a
 *          higher level. This behaves differently according to the distribution
 *          modifier selected. A "Same to" modifier will distribute an average exp
 *          value to all battle members, while a "Divide by" modifier will assigned
 *          each actor its specific experience gains.
 * 
 * Gold Modifier
 *  This affects the gold earned at the end of a battle. Its possible settings are:
 *      None
 *          Don't apply any modifiers.
 *      Proportional to Mob Size
 *          Modify the total amount of gold earned according to the mob size.
 *          The plugin engine will add an extra 10% for each enemy defeated.
 *      Proportional to Average Levels
 *          Modify the total amount of gold earned considering how troop and
 *          party average levels relate to each other. If troop average level is
 *          lower than the party average level, the amount of gold is reduced by 
 *          the same rate (troop level / party level), and if troop average level 
 *          is greater than party level the amount of gold is increased by the 
 *          same rate.
 *      Proportional to Lowest Levels
 *          Modify the total amount of gold earned proportionally to both troop
 *          and party lowest levels. The higher the difference between levels, the 
 *          greater the impact in the final value.
 *      Proportional to Highest Levels
 *          Modify the total amount of gold earned proportionally to both troop
 *          and party highest levels. The higher the difference between levels, the
 *          greater the impact in the final value.
 * 
 * =============================================================================
 * Map Note Tags
 * =============================================================================
 * 
 * Map note tags can be added to give enemies specific level ranges for each map.
 * Multiple notes can be added for the same enemy with different conditions, but
 * the first met condition is applied. So be sure to configure conditions to be
 * mutually exclusive and order them from most to less restrictive.
 * 
 * A map note tag has the following format:
 *  <TAA_EL: enemyId RANGE: lowerLevel - upperLevel>
 *  <TAA_EL: enemyId RANGE: lowerLevel - upperLevel CONDITION: evalCondition >
 * 
 * enemyId must be replaced by the enemy ID, while lowerLevel and upperLevel
 * represents the level range the enemy can have. Whenever a battle is triggered
 * with this enemy, a random level value between lowerLevel and upperLevel is 
 * generated.
 * 
 * The condition clause is optional. If not present, the level range is always 
 * used. The following data can be used inside the eval code:
 *      v[n] = is replaced by the value from the variable of number n
 *      s[n] = is replaced by the value (true or false) from the switch of 
 *             number n
 *      a[n].level = is replaced by the party member of index n level
 *      a[n].states = is replaced by an array of states applied to the party 
 *                    member of index n
 *      p.states = is replaced by a list with all states applied to all
 *                    party members
 *      p.avg = is the party battle members average level
 *      p.max = is the party battle members highest level
 *      p.min = is the party battle members lowest level
 * Keep in mind that the condition must always return a true or false value.
 * 
 * Here are a few examples:
 *  <TAA_EL: 1 RANGE: 3 - 8>
 *      This tag forces enemy ID 1 to always have a level between 3 and 8.
 * 
 *  <TAA_EL: 2 RANGE 10 - 10 CONDITION: p.avg <= v[8] >
 *      This tag forces enemy ID 2 to level 10 whenever the party battle members
 *      average level is less or equal to the value stored at the variable number 8.
 * 
 *  <TAA_EL: 5 RANGE 1 - 5 CONDITION: s[2] === false >
 *  <TAA_EL: 5 RANGE 15 - 20 CONDITION: s[2] === true >
 *      This sequence of tags forces enemy ID 5 to a level between 1 and 5 if the 
 *      switch of number 2 is off, or between 15 and 20 if it is on.
 * 
 *  <TAA_EL: 3 RANGE 3 - 9 CONDITION: p.states.contains(5) >
 *      This forces enemy ID 3 to a level between 3 and 9 if there's any party member
 *      currently affected by state ID 5.
 * 
 * =============================================================================
 * Enemy Note Tags
 * =============================================================================
 * 
 * Enemy param formulas can also be set using note tags. You can use a full tag
 * for each formula:
 *  <TAA_EL: param = formula>
 * where param can be any of the following:
 *      CLASS = Class ID
 *      MHP = Max HP
 *      MMP = Max MP
 *      ATK = Attack
 *      DEF = Defense
 *      MAT = Magical Attack
 *      MDF = Magical Defense
 *      AGI = Agility
 *      LUK = Luck
 *      EXP = Experience
 *      GOLD = Gold
 * 
 * You can also simplify a list of tags for the same enemy as follows:
 *  <TAA_EL>
 *  param1 = formula1
 *  param2 = formula2
 *  ...
 *  </TAA_EL>
 * 
 * Class settings works the same as with JSON or Plugin Manager settings. If it is
 * set and is a valid class, the enemy parameters will be based on the class parameter
 * curves. Gold and experience can still have their own formulas when basing parameters
 * in a class, but not the enemy stats.
 * 
 * When setting class base parameters through note tags, the default experience formula
 * gets ignored. That means that unless you specify another formula also using note tags,
 * enemy experience will be calculated using the class experience curve.
 * 
 * Other tags can be used to customize if the level must be shown for the enemy,
 * if stats are preserved, and even battler image changes according to level:
 *  <TAA_EL: ShowLevel = true|false>
 *      Set true to show level, or false to hide it.
 * 
 *  <TAA_EL: PreserveState = true|false>
 *      Set true to force Max HP and MP to remain the same after a level change,
 *      or false to let it get updated alongside the other parameters.
 * 
 *  <TAA_EL: Battler = level,fileName,hue>
 *      This allows you to set an alternative battler image file or hue according
 *      to level. You can omit the fileName or hue, but at least one of them must
 *      be present (level is mandatory). Just keep in mind that fileName is case
 *      sensitive, and the file location depends on your game using front or side
 *      view battle. For front view, file must be in img/enemies, while for side
 *      view file must be in img/sv_enemies.
 *      Here's a few examples:
 *          <TAA_EL: Battler = 2,,155>
 *              In this example we are omitting the fileName (thus the plugin will
 *              keep the original), and only changing hue when the enemy is level 2
 *              or higher
 *          <TAA_EL: Battler = 5,MightyBat,>
 *              Here we're changing the battler image to MightyBat at level 5 or
 *              higher, but we're not altering the battler hue.
 *          <TAA_EL: Battler = 100,Vampire,100>
 *              And here both image and hue are altered when the enemy is level
 *              100 or higher.
 * 
 *  <TAA_EL: Resist = n >
 *      This allows you to change the resist level change attribute for the enemy.
 *      It must be a value between 0 and 100, being 0 totally vulnerable to change,
 *      and 100 totally resistant.
 * 
 * You can also set level specific traits using note tags. The trait clause follows
 * the exact same pattern described in the Traits section above. The note tag must be
 * set as follows:
 *  <TAA_EL: LEVEL <lvl>: <clause> >
 *      <lvl> is the level at which the clause will start to take effect, and <clause>
 *      is the specific trait clause. Consult the Traits section for more information.
 * 
 * =============================================================================
 * Skill Note Tags
 * =============================================================================
 * 
 * Skill note tags can be used to create level changing skills (which are only
 * applied to enemies). It`s a simple tag:
 *  <TAA_EL: op levels>
 *      op is either + (to gain levels), - (to lose them), * (to multiply it)
 *      or / to divide
 *      levels is the number of levels to gain or lose
 *  
 * One important thing to note is that the effect of the skill changes according
 * to the enemy target resistance to level change. If resistance is 0, the skill 
 * takes full effect and all levels are gained/lost. Likewise, a resistance of 100
 * nullify all level change effects.
 *
 * A resistance between 0 and 100 will trigger a random validation for each level
 * to gain or lose. Take this tag as an example:
 *  <TAA_EL: +5>
 * If an enemy target has a resistance of 50, the skill has 50% chance of applying
 * 5 level changes. That means the skill can apply an increase of 0 to 5 levels.
 * If resistance is 0, 5 levels are gained.
 * 
 * This resistance, however, works differently when using multiply or divide levels.
 * In this case, resistance can either fail or succeed the level change, but never
 * an intermediate result.
 * 
 * ============================================================================
 * Script Calls
 * ============================================================================
 * 
 * $gameSystem.showEnemyLevel()
 *  - Returns true if global config is set to show enemy levels. False if it is
 *    set to hide it
 *
 * $gameSystem.setShowEnemyLevel(state)
 *  - Change show enemy level global config. "state" must be either true or false.
 *
 * $gameSystem.enemyLevelPreserveStats()
 *  - Returns true if global config is set to preserve enemies Max HP and MP when
 *    applying a level change. False if set to don't preserve
 *
 * $gameSystem.enemyLevelResistChange()
 *  - Returns global config for how likely the enemy is to resist a level change.
 *    It's a number between 0 and 100, being 100 totally resistant.
 *
 * $gameSystem.enemyLevelRule()
 *  - Returns active dynamic level rule.
 *
 * $gameSystem.setEnemyLevelRule(rule)
 *  - Change dynamic enemy level rule. "rule" must take one of the following values:
 *      0: Party Average Level
 *      1: Party Lowest Level
 *      2: Party Highest Level
 *
 * $gameSystem.enemyLevelNegativeFluctuation()
 *  - Returns the lower level range used with the dynamic level rule.
 *
 * $gameSystem.setNegativeRange(value, action)
 *  - Change lower level range used with the dynamic level rule. "action" describes
 *    how "value" will be applied:
 *      + if not present (undefined), or equal to '=' or 'set': Change lower level range
 *        to the exact value of 'value'
 *      + '+', 'add', 'gain' or 'increase': adds value to the current lower level range
 *        value
 *      + '-', 'remove', 'lose' or 'decrease': subtract value from the current lower
 *        level range value
 *      + '*' or 'multiply': multiply value to the current lower level range value
 *      + '/' or 'divide': divide current lower level range value by 'value'
 *
 * $gameSystem.enemyLevelPositiveFluctuation()
 *  - Returns the upper level range used with the dynamic level rule.
 *
 * $gameSystem.setPositiveRange(value, action)
 *  - Change upper level range used with the dynamic level rule. "action" describes
 *    how "value" will be applied:
 *      + if not present (undefined), or equal to '=' or 'set': Change upper level range
 *        to the exact value of 'value'
 *      + '+', 'add', 'gain' or 'increase': adds value to the current upper level range
 *        value
 *      + '-', 'remove', 'lose' or 'decrease': subtract value from the current upper
 *        level range value
 *      + '*' or 'multiply': multiply value to the current upper level range value
 *      + '/' or 'divide': divide current upper level range value by 'value'
 *
 * $gameSistem.changeEnemyLevel(enemy, operation, value)
 *  - Must be used inside battle to change an enemy level (if its resistance to change
 *    allows). 'enemy' is the the enemy position in the troop, or 'all' to apply to all
 *    enemies at the same time. 'value' is the number of levels to change and 'operation' 
 *    defines how level will be applied:
 *      + Use '=' to set the enemy level to exactly 'value'
 *      + Use '+' to add 'value' to the current enemy level
 *      + Use '-' to decrease 'value' from the current enemy level
 *      + Use '*' to multiply current enemy level by 'value'
 *      + Use '/' to divide current enemy level by 'value'
 *
 * $gameSystem.resetEnemyLevel(enemy)
 *  - Must be used inside battle to reset enemy's to their starting level. 'enemy' must
 *    be either the position of an enemy in the troop, or 'all' to reset the whole troop
 *    at the same time.
 * 
 * ============================================================================
 * Plugin Commands (MV)
 * ============================================================================
 *
 * EnemyLevel show
 * EnemyLevel hide
 *  - Change the Show Level global config to show or hide enemy levels.
 *
 * EnemyLevel rule lowest
 * EnemyLevel rule highest
 * EnemyLevel rule average
 *  - Change the dynamic level rule.
 *
 * EnemyLevel LowerRange value
 * EnemyLevel UpperRange value
 *  - Change either the lower or upper level range to the specified value. To use a variable
 *    contents, 'value' must be passed as 'v[n]', where n is the variable number.
 *
 * EnemyLevel enemy operator value
 *  - Must be used inside battle to change an enemy level (if its resistance to change
 *    allows). 'enemy' is the the enemy position in the troop, or 'all' to apply to all
 *    enemies at the same time. 'value' is the number of levels to change and 'operation' 
 *    defines how level will be applied:
 *      + Use '=' to set the enemy level to exactly 'value'
 *      + Use '+' to add 'value' to the current enemy level
 *      + Use '-' to decrease 'value' from the current enemy level
 *      + Use '*' to multiply current enemy level by 'value'
 *      + Use '/' to divide current enemy level by 'value'
 *
 * EnemyLevel enemy reset
 *  - Must be used inside battle to reset enemy's to their starting level. 'enemy' must
 *    be either the position of an enemy in the troop, or 'all' to reset the whole troop
 *    at the same time.
 * 
 * ============================================================================
 * Plugin Commands (MZ)
 * ============================================================================
 *
 * Show Enemy Levels
 *  - Change the Show Level global config to show or hide enemy levels.
 *
 * Change Dynamic Level Rule
 *  - Change the dynamic level rule.
 *
 * Change Level Range
 *  - Change either the lower or upper level range to the specified value.
 *
 * Change Enemy Level
 *  - Must be used inside battle to change an enemy level (if its resistance to change
 *    allows).
 * 
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 0.5.0:
 *  - Initial version with enemy levels and datasource setup
 * Version 0.6.0:
 *  - Included modifiers to experience and gold earned at the end of the battle
 *  - Added feature to allow changes on the enemy battler according to its level
 *  - Added note tags as an alternative to setup enemy formulas
 * Version 0.7.0:
 *  - Added functions to change enemy level through skills
 *  - Added Plugin Commands for both MV and MZ
 * Version 0.8.0:
 *  - A few fixes and changes
 *  - Beta release
 * Version 1.0.0:
 *  - Fixed a bug on battler image variations on level change;
 *  - Fixed a bug on applying intermediary level change resistances;
 *  - Fixed a bug in the experience distribution modifier that would cause experience to
 *    be reduced to zero;
 *  - Added a parameter that determines how much each mob member will affect gold and
 *    experience if the proper modifiers are selected;
 *  - Fixed a bug in the battle logs when decreasing an enemy level;
 *  - Added the ability to change the enemy name with its level;
 * Version 1.1.0:
 *  - Included support functions used by TAA_EnemyReinforcements;
 * Version 1.2.0:
 *  - Added functions to allow enemy parameters to be based on class settings;
 *  - Added customized traits based on enemy level;
 *  - Added note tags to setup enemy parameters by class an level specific traits;
 * Version 1.2.1:
 *  - Refactored a bit of code to make for smoother compatibility with other plugins that
 *    extends enemy setup;
 *
 * ============================================================================
 * End of Help
 * ============================================================================
 * 
 * 
 * 
 * =================================================================================
 * Commands (MZ)
 * =================================================================================
 * 
 * @command enemyLevel
 * @text Change Enemy Level
 * @desc Manage enemy levels
 * 
 * @arg scope
 * @text Scope
 * @type select
 * @option Enemy
 * @option Troop
 * @default Enemy
 * @desc Choose the scope to apply the command to.
 * 
 * @arg enemyId
 * @text Troop Index
 * @type number
 * @min 1
 * @default 1
 * @desc Enemy to manage (as an index in the troop array). This is ignored if scope is set to 'Troop'.
 * 
 * @arg action
 * @text Operation
 * @type select
 * @option Set
 * @value '='
 * @option Gain
 * @value '+'
 * @option Lose
 * @value '-'
 * @option Multiply
 * @value *
 * @option Divide
 * @value /
 * @default '='
 * @desc Define what operation to execute on the enemy level.
 * 
 * @arg value
 * @text Value
 * @type number
 * @min 1
 * @default 1
 * @desc Value used to apply the selected operation.
 * 
 * @command reset
 * @text Reset Enemy Levels
 * @desc Reset enemy levels
 * 
 * @arg scope
 * @text Scope
 * @type select
 * @option Enemy
 * @option Troop
 * @default Enemy
 * @desc Choose the scope to apply the command to.
 * 
 * @arg enemyId
 * @text Troop Index
 * @type number
 * @min 1
 * @default 1
 * @desc Enemy to reset (referenced by its index in the troop array). This is ignored if scope is set to 'Troop'.
 * 
 * @command range
 * @text Change Level Range
 * @desc Manage global level fluctuation range.
 * 
 * @arg type
 * @text Range Type
 * @type select
 * @option Lower Range
 * @option Upper Range
 * @default Lower Range
 * @desc Choose which range to update.
 * 
 * @arg action
 * @text Operation
 * @type select
 * @option Set
 * @value =
 * @option Gain
 * @value +
 * @option Lose
 * @value -
 * @option Multiply
 * @value *
 * @option Divide
 * @value /
 * @default '='
 * @desc Define what operation to execute on level range.
 * 
 * @arg value
 * @text Value
 * @type number
 * @min 1
 * @default 1
 * @desc Value used to apply the selected operation. This option is ignored if a variable is set on 'Variable'
 *
 * @arg var
 * @text Variable
 * @type variable
 * @default 
 * @desc Select a variable to use it instead of a fixed value.
 * 
 * @command showLevel
 * @text Show Enemy Levels
 * @desc Show / Hide enemy levels.
 * 
 * @arg action
 * @text Action
 * @type boolean
 * @on SHOW
 * @off HIDE
 * @default true
 * @desc 
 * 
 * @command dynamicRule
 * @text Change Dynamic Level Rule
 * @desc Manage dynamic level rule changes.
 * 
 * @arg rule
 * @text Rule
 * @type select
 * @option Party lowest level
 * @option Party average level
 * @option Party highest level
 * @default Party average level
 * @desc Defines how dynamic enemy levels are set if no specific rule is defined.
 * 
 * =================================================================================
 * Parameters
 * =================================================================================
 * 
 * @param ---DataSource Config---
 * @default
 * 
 * @param SourceType
 * @parent ---DataSource Config---
 * @text DataSource Type
 * @type select
 * @option JSON File
 * @option Plugin Manager
 * @default JSON File
 * @desc Select the main source type for enemy leveling data.
 * 
 * @param JSON Config
 * @parent ---DataSource Config---
 * @type struct<JsonConfig>
 * @desc Configure properties when using a JSON file as a datasource.
 * @default {"File":"EnemyExtra.json","ID Object":"id","Class Object":"class","Max HP Object":"mhp","Max MP Object":"mmp","Attack Object":"atk","Defense Object":"def","Magical Attack Object":"mat","Magical Defense Object":"mdf","Agility Object":"agi","Luck Object":"luk","Experience Object":"exp","Gold Object":"gold","Show Level Object":"showLevel","Preserve Stats Object":"preserveStats","Resist Change Object":"resist","Battler Array Object":"battler","Battler Level Object":"level","Battler Name Object":"battlerName","Battler Hue Object":"battlerHue","Enemy Name Object":"name"}
 * 
 * @param Plugin Manager Data
 * @parent ---DataSource Config---
 * @type struct<PMData>[]
 * @desc Configure enemy level data through Plugin Manager if this datasource type is selected.
 * @default []
 * 
 * @param ---Global Configs---
 * @default
 * 
 * @param Show Enemy Level
 * @parent ---Global Configs---
 * @type boolean
 * @on SHOW
 * @off HIDE
 * @default true
 * @desc Show / hide enemy level on enemy name during battle.
 * 
 * @param Enemy Name Display
 * @parent ---Global Configs---
 * @type text
 * @default Lv%2 %1 %3
 * @desc Customize enemy name display. %1 = Enemy Name; %2 = Enemy Level; %3 = Enemy Letter.
 * 
 * @param Preserve Stats
 * @parent ---Global Configs---
 * @type boolean
 * @on ENABLE
 * @off DISABLE
 * @default true
 * @desc If enabled, a level change won't affect max HP and MP, only the other params. If disabled, max HP and MP are also affected.
 * 
 * @param Resist Level Change
 * @parent ---Global Configs---
 * @type number
 * @min 0
 * @max 100
 * @default 0
 * @desc Defines how likely is the enemy to resist a level change (percentage). 0 means no resistance, 100 means always resist.
 * 
 * @param ---Dynamic Levels---
 * @default
 * 
 * @param Dynamic Level Rule
 * @parent ---Dynamic Levels---
 * @type select
 * @option Party lowest level
 * @option Party average level
 * @option Party highest level
 * @default Party average level
 * @desc Defines how dynamic enemy levels are set if no specific rule is defined.
 * 
 * @param Negative Range
 * @parent ---Dynamic Levels---
 * @type number
 * @min 0
 * @default 3
 * @desc Sets dynamic level negative fluctuation.
 * 
 * @param Positive Range
 * @parent ---Dynamic Levels---
 * @type number
 * @min 0
 * @default 3
 * @desc Sets Dynamic level positive fluctuation.
 * 
 * @param ---Level Variables---
 * @default 
 * 
 * @param Manual Lower Level
 * @parent ---Level Variables---
 * @type variable
 * @default 0
 * @desc Variable that defines a manual lower level range.
 * 
 * @param Manual Upper Level
 * @parent ---Level Variables---
 * @type variable
 * @default 0
 * @desc Variable that defines a manual upper level range.
 * 
 * @param Level Modifier
 * @parent ---Level Variables---
 * @type variable
 * @default 0
 * @desc Variable for a level modifier. This variable value will always be added to our enemy level.
 * 
 * @param ---Modifiers---
 * @default 
 * 
 * @param Experience Distribution Modifier
 * @parent ---Modifiers---
 * @type select
 * @option None
 * @option Divide by Alive Members
 * @option Divide by All Members
 * @option Same to Alive Members
 * @option Same to All Members
 * @default Divide by Alive Members
 * @desc Modify how experience is distributed to the party after battle.
 * 
 * @param Experience Value Modifier
 * @parent ---Modifiers---
 * @type select
 * @option None
 * @option Proportional to Mob Size
 * @option Proportional to Average Levels
 * @option Proportional to Lowest Levels
 * @option Proportional to Highest Levels
 * @option Proportional to Exact Levels
 * @default Proportional to Exact Levels
 * @desc Modify how gained experience is calculated after battle.
 * 
 * @param Gold Modifier
 * @parent ---Modifiers---
 * @type select
 * @option None
 * @option Proportional to Mob Size
 * @option Proportional to Average Levels
 * @option Proportional to Lowest Levels
 * @option Proportional to Highest Levels
 * @default None
 * @desc Modify how gained gold is calculated after battle.
 * 
 * @param Mob Size Effect
 * @parent ---Modifiers---
 * @type number
 * @decimals 2
 * @min 0
 * @default 10.00
 * @desc How much (%) will each mob member increase experience or gold if the appropriate modifier is set.
 * 
 * @param ---Default Formulas---
 * @default
 * 
 * @param Class
 * @parent ---Default Formulas---
 * @type number
 * @min 0
 * @default 0
 * @desc Class ID to assign by default to an enemy. If 0, formulas are used. Otherwise, formulas are ignored and class data is used.
 * 
 * @param Max HP
 * @parent ---Default Formulas---
 * @type text
 * @default base + ((level - 1) * 90)
 * @desc HP formula to use in case there's no enemy specific formula.
 * 
 * @param Max MP
 * @parent ---Default Formulas---
 * @type text
 * @default base * ((level - 1) * 45)
 * @desc MP formula to use in case there's no enemy specific formula.
 * 
 * @param Attack
 * @parent ---Default Formulas---
 * @type text
 * @default base + ((level - 1) * 12)
 * @desc Attack formula to use in case there's no enemy specific formula.
 * 
 * @param Defense
 * @parent ---Default Formulas---
 * @type text
 * @default base + ((level - 1) * 11)
 * @desc Defense formula to use in case there's no enemy specific formula.
 * 
 * @param Magical Attack
 * @parent ---Default Formulas---
 * @type text
 * @default base + ((level - 1) * 12)
 * @desc Magical Attack formula to use in case there's no enemy specific formula.
 * 
 * @param Magical Defense
 * @parent ---Default Formulas---
 * @type text
 * @default base + ((level - 1) * 11)
 * @desc Magical Defense formula to use in case there's no enemy specific formula.
 * 
 * @param Agility
 * @parent ---Default Formulas---
 * @type text
 * @default base + ((level - 1) * 8)
 * @desc Agility formula to use in case there's no enemy specific formula.
 * 
 * @param Luck
 * @parent ---Default Formulas---
 * @type text
 * @default base + ((level - 1) * 7)
 * @desc Luck formula to use in case there's no enemy specific formula.
 * 
 * @param Experience
 * @parent ---Default Formulas---
 * @type text
 * @default base + ((level - 1) * 30)
 * @desc Experience formula to use in case there's no enemy specific formula.
 * 
 * @param Gold
 * @parent ---Default Formulas---
 * @type text
 * @default base + ((level - 1) * 55)
 * @desc Gold formula to use in case there's no enemy specific formula.
 * 
 * @param ---Battle Logs---
 * @type text
 * 
 * @param Enable Battle Logs
 * @parent ---Battle Logs---
 * @type boolean
 * @on ENABLE
 * @off DISABLE
 * @default true
 * @desc Enable or disable enemy reinforcements battle logs.
 * 
 * @param Success Message
 * @parent ---Battle Logs---
 * @type text
 * @default %1 level has changed from %2 to %3!
 * @desc Message to display when the level change succeeds. %1 - Enemy Name. %2 - Enemy old level. %3 - Enemy new level.
 * 
 * @param Fail Message
 * @parent ---Battle Logs---
 * @type text
 * @default There was no effect.
 * @desc Message to display if a level change skill has been used with no effect.
 * 
 */

//=============================================================================
// JSON File Configuration
//=============================================================================
 /*~struct~JsonConfig:
 * @param File
 * @type text
 * @default EnemyExtra.json
 * @desc Enemy Levels JSON file on the data folder.
 * 
 * @param ID Object
 * @type text
 * @default id
 * @desc Object for the enemy ID (default: id)
 * 
 * @param Class Object
 * @type text
 * @default class
 * @desc Object referencing a Class.
 * 
 * @param Max HP Object
 * @type text
 * @default mhp
 * @desc Object referencing a Max HP formula.
 * 
 * @param Max MP Object
 * @type text
 * @default mmp
 * @desc Object referencing a Max MP formula.
 * 
 * @param Attack Object
 * @type text
 * @default atk
 * @desc Object referencing a Attack formula.
 * 
 * @param Defense Object
 * @type text
 * @default def
 * @desc Object referencing a Defense formula.
 * 
 * @param Magical Attack Object
 * @type text
 * @default mat
 * @desc Object referencing a Magical Attack formula.
 * 
 * @param Magical Defense Object
 * @type text
 * @default mdf
 * @desc Object referencing a Magical Defense formula.
 * 
 * @param Agility Object
 * @type text
 * @default agi
 * @desc Object referencing a Agility formula.
 * 
 * @param Luck Object
 * @type text
 * @default luk
 * @desc Object referencing a Luck formula.
 * 
 * @param Experience Object
 * @type text
 * @default exp
 * @desc Object referencing a Experience formula.
 * 
 * @param Gold Object
 * @type text
 * @default gold
 * @desc Object referencing a Gold formula.
 * 
 * @param Show Level Object
 * @type text
 * @default showLevel
 * @desc Object referencing the option to change show level default behavior.
 * 
 * @param Preserve Stats Object
 * @type text
 * @default preserveStats
 * @desc Object referencing the option to change preserve stats default behavior.
 * 
 * @param Resist Change Object
 * @type text
 * @default resist
 * @desc Object referencing the option to change level change resistance.
 * 
 * @param Battler Array Object
 * @type text
 * @default battler
 * @desc Object referencing the array of battler sprite changes.
 * 
 * @param Battler Level Object
 * @type text
 * @default level
 * @desc Object referencing the level at which to start manipulating battler graphics.
 * 
 * @param Battler Name Object
 * @type text
 * @default battlerName
 * @desc Object referencing the battler file name (without file extension).
 * 
 * @param Battler Hue Object
 * @type text
 * @default battlerHue
 * @desc Object referencing the battler hue value.
 * 
 * @param Enemy Name Object
 * @type text
 * @default name
 * @desc Object referencing the enemy name.
 * 
 * @param Traits Array Object
 * @type text
 * @default traits
 * @desc Object referencing the array of trait settings.
 * 
 */

//=============================================================================
// Plugin Manager Data
//=============================================================================
 /*~struct~PMData:
 * @param Enemy ID
 * @type number
 * @min 1
 * @default 1
 * @desc Enemy ID to apply leveling formulas to.
 * 
 * @param Class
 * @type number
 * @min 0
 * @default 0
 * @desc Class ID to consider when loading level data. If 0, formulas are used. Otherwise, ignore formulas and use class data.
 * 
 * @param Max HP
 * @type text
 * @default base + ((level - 1) * 90)
 * @desc HP formula to use in case there's no enemy specific formula.
 * 
 * @param Max MP
 * @type text
 * @default base + ((level - 1) * 45)
 * @desc MP formula to use in case there's no enemy specific formula.
 * 
 * @param Attack
 * @type text
 * @default base + ((level - 1) * 12)
 * @desc Attack formula to use in case there's no enemy specific formula.
 * 
 * @param Defense
 * @type text
 * @default base + ((level - 1) * 11)
 * @desc Defense formula to use in case there's no enemy specific formula.
 * 
 * @param Magical Attack
 * @type text
 * @default base + ((level -1) * 12)
 * @desc Magical Attack formula to use in case there's no enemy specific formula.
 * 
 * @param Magical Defense
 * @type text
 * @default base + ((level - 1) * 11)
 * @desc Magical Defense formula to use in case there's no enemy specific formula.
 * 
 * @param Agility
 * @type text
 * @default base + ((level - 1) * 8)
 * @desc Agility formula to use in case there's no enemy specific formula.
 * 
 * @param Luck
 * @type text
 * @default base + ((level - 1) * 7)
 * @desc Luck formula to use in case there's no enemy specific formula.
 * 
 * @param Experience
 * @type text
 * @default base + ((level - 1) * 30)
 * @desc Experience formula to use in case there's no enemy specific formula.
 * 
 * @param Gold
 * @type text
 * @default base + ((level - 1) * 55)
 * @desc Gold formula to use in case there's no enemy specific formula.
 * 
 * @param Show Level
 * @type boolean
 * @on SHOW
 * @off HIDE
 * @default true
 * @desc Customize if level should be displayed for this enemy.
 * 
 * @param Preserve Stats
 * @type boolean
 * @on ENABLE
 * @off DISABLE
 * @default true
 * @desc Customize if max HP and MP should be preserved on level change.
 * 
 * @param Resist Change
 * @type number
 * @min 0
 * @max 100
 * @default 0
 * @desc Customize how likely is the enemy to resist level changes during battle.
 * 
 * @param Battler Images
 * @type struct<Battler>[]
 * @default []
 * @desc Battle image transformations based on enemy levels.
 * 
 * @param Traits
 * @type text[]
 * @default []
 * @desc Trait settings based on enemy level.
 * 
 */
/*~struct~Battler:
 * @param Level
 * @type number
 * @min 1
 * @default 1
 * @desc Level at which to change the enemy battler.
 * 
 * @param Battler Name
 * @type file
 * @dir img/enemies
 * @require 1
 * @default 
 * @desc Enemy image to change to (front-view battle system only)
 * 
 * @param SV Battler Name
 * @type file
 * @dir img/sv_enemies
 * @require 1
 * @default
 * @desc Enemy image to change to (side-view battle system only)
 * 
 * @param Battler Hue
 * @type number
 * @min 0
 * @max 255
 * @default 0
 * @desc Image hue to change to.
 * 
 * @param Enemy Name
 * @type text
 * @default 
 * @desc Enemy name to set when the desired level is reached.
 *
 */

//=============================================================================
// Local Functions
//=============================================================================

TAA.el.functions = TAA.el.functions || {};
TAA.el.functions.getDynamicLevelType = function(typeText){
    switch(typeText.toLowerCase()){
        case 'party lowest level':
            return 1;
        case 'party highest level':
            return 2;
        case 'party average level':
        default:
            return 0;
    }
};

//=============================================================================
// Parameters Setup
//=============================================================================

TAA.el.Parameters = TAA.el.Parameters || {};
var Parameters = PluginManager.parameters(TAA.el.PluginName);

// Datasource parameters
TAA.el.Parameters.SourceType = Parameters['SourceType'] || 'JSON File';
TAA.el.Parameters.JsonConfig = JSON.parse(Parameters['JSON Config']);
TAA.el.Parameters.PMData = JSON.parse(Parameters['Plugin Manager Data']);

// Default formulas
TAA.el.Parameters.Default = TAA.el.Parameters.Default || {};
TAA.el.Parameters.Default.class = Parameters['Class'];
TAA.el.Parameters.Default.mhp = Parameters['Max HP'];
TAA.el.Parameters.Default.mmp = Parameters['Max MP'];
TAA.el.Parameters.Default.atk = Parameters['Attack'];
TAA.el.Parameters.Default.def = Parameters['Defense'];
TAA.el.Parameters.Default.mat = Parameters['Magical Attack'];
TAA.el.Parameters.Default.mdf = Parameters['Magical Defense'];
TAA.el.Parameters.Default.agi = Parameters['Agility'];
TAA.el.Parameters.Default.luk = Parameters['Luck'];
TAA.el.Parameters.Default.exp = Parameters['Experience'];
TAA.el.Parameters.Default.gold = Parameters['Gold'];

// Global Configs
TAA.el.Parameters.ShowLevel = Parameters['Show Enemy Level'] === 'true';
TAA.el.Parameters.NameDisplay = Parameters['Enemy Name Display'];
TAA.el.Parameters.PreserveStats = Parameters['Preserve Stats'] === 'true';
TAA.el.Parameters.ResistChange = !isNaN(Parameters['Resist Level Change']) ? parseInt(Parameters['Resist Level Change']) : 0;
// Dynamic Levels
TAA.el.Parameters.DynamicLevels = TAA.el.Parameters.DynamicLevels || {};
TAA.el.Parameters.DynamicLevels.Type = TAA.el.functions.getDynamicLevelType(Parameters['Dynamic Level Rule']);
TAA.el.Parameters.DynamicLevels.NegativeRange = !isNaN(Parameters['Negative Range']) ? parseInt(Parameters['Negative Range']) : 3;
TAA.el.Parameters.DynamicLevels.PositiveRange = !isNaN(Parameters['Positive Range']) ? parseInt(Parameters['Positive Range']) : 3;
// Level Variables
TAA.el.Parameters.Variables = TAA.el.Parameters.Variables || {};
TAA.el.Parameters.Variables.ManualLower = !isNaN(Parameters['Manual Lower Level']) ? parseInt(Parameters['Manual Lower Level']) : 0;
TAA.el.Parameters.Variables.ManualUpper = !isNaN(Parameters['Manual Upper Level']) ? parseInt(Parameters['Manual Upper Level']) : 0;
TAA.el.Parameters.Variables.Modifier = !isNaN(Parameters['Level Modifier']) ? parseInt(Parameters['Level Modifier']) : 0;
// Modifiers
TAA.el.Parameters.Modifiers = TAA.el.Parameters.Modifiers || {};
TAA.el.Parameters.Modifiers.ExpDistribution = Parameters['Experience Distribution Modifier'];
TAA.el.Parameters.Modifiers.ExpValue = Parameters['Experience Value Modifier'];
TAA.el.Parameters.Modifiers.Gold = Parameters['Gold Modifier'];
TAA.el.Parameters.Modifiers.MobEffect = (!isNaN(Parameters['Mob Size Effect'])) ? parseFloat(Parameters['Mob Size Effect']) : 10.0;
// Battle Logs
TAA.el.Parameters.BattleLog = TAA.el.Parameters.BattleLog || {};
TAA.el.Parameters.BattleLog.Enable = Parameters['Enable Battle Logs'] === 'true';
TAA.el.Parameters.BattleLog.SingleMsg = Parameters['Success Message'];
TAA.el.Parameters.BattleLog.FailedMsg = Parameters['Fail Message'];

//=============================================================================
// DataManager
//=============================================================================

TAA.el.alias.DataManager = TAA.el.alias.DataManager || {};
TAA.el.alias.DataManager.createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function(){
    TAA.el.alias.DataManager.createGameObjects.call(this);
    EnemyDataManager.initialize();
};

if(TAA.el.Parameters.SourceType === 'JSON File'){
    var file = TAA.el.Parameters.JsonConfig['File'] || 'EnemyExtra.json';
    DataManager._databaseFiles.push({ name: '$taaEnemyData', src: file });

    TAA.el.alias.DataManager.loadDataFile = DataManager.loadDataFile;
    DataManager.loadDataFile = function(name, src){
        var file = TAA.el.Parameters.JsonConfig['File'] || 'EnemyExtra.json';
        file = 'Test_' + file;
        if(src === file)
            src = TAA.el.Parameters.JsonConfig['File'] || 'EnemyExtra.json';
        TAA.el.alias.DataManager.loadDataFile.call(this, name, src);
    }
}

var $taaEnemyData = $taaEnemyData || [];


//=============================================================================
// Enemy Data Manager
//=============================================================================

function EnemyDataManager() {
    throw new Error('This is a static class');
};

/**
 * Initializes Enemy Data Manager
 * 
 * @static
 * @method initialize
 */
TAA.el.alias.EnemyDataManager = TAA.el.alias.EnemyDataManager || {};
TAA.el.alias.EnemyDataManager.initialize = EnemyDataManager.initialize;
EnemyDataManager.initialize = function(){
    if(TAA.el.Parameters.SourceType === 'JSON File'){
        this.initByJson();
        this.reorderJsonData();
    }
    else {
        this.initByPluginManager();
        this.organizePMData();
    }
    if(TAA.el.alias.EnemyDataManager.initialize !== undefined) 
        TAA.el.alias.EnemyDataManager.initialize.call(this);
};

/**
 * Initializes Enemy Data Manager through a JSON file
 * 
 * @static
 * @method initByJson
 */
TAA.el.alias.EnemyDataManager.initByJson = EnemyDataManager.initByJson;
EnemyDataManager.initByJson = function() {
    if(TAA.el.alias.EnemyDataManager.initByJson !== undefined)
        TAA.el.alias.EnemyDataManager.initByJson.call(this);

    this._idObject = TAA.el.Parameters.JsonConfig['ID Object'] || "id";
    this._classObject = TAA.el.Parameters.JsonConfig['Class Object'] || "class";
    this._mhpObject = TAA.el.Parameters.JsonConfig['Max HP Object'] || "mhp";
    this._mmpObject = TAA.el.Parameters.JsonConfig['Max MP Object'] || "mmp";
    this._atkObject = TAA.el.Parameters.JsonConfig['Attack Object'] || "atk";
    this._defObject = TAA.el.Parameters.JsonConfig['Defense Object'] || "def";
    this._matObject = TAA.el.Parameters.JsonConfig['Magical Attack Object'] || "mat";
    this._mdfObject = TAA.el.Parameters.JsonConfig['Magical Defense Object'] || "mdf";
    this._agiObject = TAA.el.Parameters.JsonConfig['Agility Object'] || "agi";
    this._lukObject = TAA.el.Parameters.JsonConfig['Luck Object'] || "luk";
    this._expObject = TAA.el.Parameters.JsonConfig['Experience Object'] || "exp";
    this._goldObject = TAA.el.Parameters.JsonConfig['Gold Object'] || "gold";

    this._showLevelObject = TAA.el.Parameters.JsonConfig['Show Level Object'] || "showLevel";
    this._preserveStatsObject = TAA.el.Parameters.JsonConfig['Preserve Stats Object'] || "preserve";
    this._resistChangeObject = TAA.el.Parameters.JsonConfig['Resist Change Object'] || "resist";

    this._battlerArrayObject = TAA.el.Parameters.JsonConfig['Battler Array Object'] || "battler";
    this._battlerLevelObject = TAA.el.Parameters.JsonConfig['Battler Level Object'] || "level";
    this._battlerNameObject = TAA.el.Parameters.JsonConfig['Battler Name Object'] || "battlerName";
    this._battlerHueObject = TAA.el.Parameters.JsonConfig['Battler Hue Object'] || "battlerHue";
    this._battlerEnemyNameObject = TAA.el.Parameters.JsonConfig['Enemy Name Object'] || "name";
    this._traitsObject = TAA.el.Parameters.JsonConfig['Traits Array Object'] || "traits";
};

/**
 * Initializes Enemy Data Manager through Plugin Manager data
 * 
 * @static
 * @method initByPluginManager
 */
TAA.el.alias.EnemyDataManager.initByPluginManager = EnemyDataManager.initByPluginManager;
EnemyDataManager.initByPluginManager = function(){
    if(TAA.el.alias.EnemyDataManager.initByPluginManager !== undefined)
        TAA.el.alias.EnemyDataManager.initByPluginManager.call(this);

    this._idObject = 'Enemy ID';
    this._classObject = "Class"
    this._mhpObject = 'Max HP';
    this._mmpObject = 'Max MP';
    this._atkObject = 'Attack';
    this._defObject = 'Defense';
    this._matObject = 'Magical Attack';
    this._mdfObject = 'Magical Defense';
    this._agiObject = 'Agility';
    this._lukObject = 'Luck';
    this._expObject = 'Experience';
    this._goldObject = 'Gold';

    this._showLevelObject = 'Show Level';
    this._preserveStatsObject = 'Preserve Stats';
    this._resistChangeObject = 'Resist Change';

    this._battlerArrayObject = 'Battler Images';
    this._battlerLevelObject = 'Level';
    this._battlerNameObject = $gameSystem.isSideView() ? 'SV Battler Name' : 'Battler Name';
    this._battlerHueObject = 'Battler Hue';
    this._battlerEnemyNameObject = 'Enemy Name';
    this._traitsObject = "Traits";
};

/**
 * Organizes Plugin Manager Data
 * 
 * @static
 * @method organizePMData
 */
TAA.el.alias.EnemyDataManager.organizePMData = EnemyDataManager.organizePMData;
EnemyDataManager.organizePMData = function(){
    // If there's a previous plugin with this function set, preserve initial code
    if(TAA.el.alias.EnemyDataManager.organizePMData !== undefined)
        TAA.el.alias.EnemyDataManager.organizePMData.call(this);
    
    for(var i=0; i < TAA.el.Parameters.PMData.length; i++){
        var enemyData = this.parsePMData(TAA.el.Parameters.PMData[i]);
        if(enemyData && !isNaN(enemyData[this._idObject])){
            var id = enemyData[this._idObject];
            $taaEnemyData[id] = enemyData;
        }
    }
};

/**
 * Parses trait clauses and converts them to objects
 * 
 * @static
 * @method parseTraitTag
 */
EnemyDataManager.parseTraitTag = function(traitList){
    var traits = {};
    for(var i=0; i<traitList.length; i++){
        var trait = {};
        var level = undefined;
        if(traitList[i].match(/(?:LVL|LEVEL)\s+(\d+)\s*:\s*element\s+rate\s+(\d+)\s+(\d+)/i)){
            level = Math.max(1, parseInt(RegExp.$1));
            var element = Math.max(1, parseInt(RegExp.$2));
            var rate = Math.max(0, parseInt(RegExp.$3));
            trait.code = Game_BattlerBase.TRAIT_ELEMENT_RATE;
            trait.dataId = element;
            trait.value = rate;
        }
        else if(traitList[i].match(/(?:LVL|LEVEL)\s+(\d+)\s*:\s*debuff\s+rate\s+(MHP|MMP|ATK|DEF|MAT|MDF|AGI|LUK)\s+(\d+)/i)){
            level = Math.max(1, parseInt(RegExp.$1));
            var param = RegExp.$2;
            var rate = Math.max(0, parseInt(RegExp.$3));
            trait.code = Game_BattlerBase.TRAIT_DEBUFF_RATE;
            trait.dataId = this.getParamIdFromName(param);
            trait.value = rate;
        }
        else if(traitList[i].match(/(?:LVL|LEVEL)\s+(\d+)\s*:\s*state\s+rate\s+(\d+)\s+(\d+)/i)){
            level = Math.max(1, parseInt(RegExp.$1));
            var state = Math.max(1, parseInt(RegExp.$2));
            var rate = Math.max(0, parseInt(RegExp.$3));
            trait.code = Game_BattlerBase.TRAIT_STATE_RATE;
            trait.dataId = state;
            trait.value = rate;
        }
        else if(traitList[i].match(/(?:LVL|LEVEL)\s+(\d+)\s*:\s*state\s+resist\s+(\d+)/i)){
            level = Math.max(1, parseInt(RegExp.$1));
            var state = Math.max(1, parseInt(RegExp.$2));
            trait.code = Game_BattlerBase.TRAIT_STATE_RESIST;
            trait.dataId = state;
        }
        else if(traitList[i].match(/(?:LVL|LEVEL)\s+(\d+)\s*:\s*EX\s+PARAM\s+(HIT|EVA|CRI|CEV|MEV|MRF|CNT|HRG|MRG|TRG)\s+(\d+)/i)){
            level = Math.max(1, parseInt(RegExp.$1));
            var xparam = RegExp.$2;
            var rate = Math.max(0, parseInt(RegExp.$3));
            trait.code = Game_BattlerBase.TRAIT_XPARAM;
            trait.dataId = this.getParamIdFromName(xparam);
            trait.value = rate;
        }
        else if(traitList[i].match(/(?:LVL|LEVEL)\s+(\d+)\s*:\s*SP\s+PARAM\s+(TGR|GRD|REC|PHA|MCR|TCR|PDR|MDR|FDR|EXR)\s+(\d+)/i)){
            level = Math.max(1, parseInt(RegExp.$1));
            var sparam = RegExp.$2;
            var rate = Math.max(0, parseInt(RegExp.$3));
            trait.code = Game_BattlerBase.TRAIT_SPARAM;
            trait.dataId = this.getParamIdFromName(sparam);
            trait.value = rate;
        }
        else if(traitList[i].match(/(?:LVL|LEVEL)\s+(\d+)\s*:\s*(?:attack|atk)\s+(element|speed|times)\s+(\d+)/i)){
            level = Math.max(1, parseInt(RegExp.$1));
            var type = (RegExp.$2).toLowerCase();
            var value = parseInt(RegExp.$3);
            switch(type){
                case 'element':
                    trait.code = Game_BattlerBase.TRAIT_ATTACK_ELEMENT;
                    trait.dataId = value;
                    break;
                case 'speed':
                    trait.code = Game_BattlerBase.TRAIT_ATTACK_SPEED;
                    trait.value = value;
                    break;
                case 'times':
                    trait.code = Game_BattlerBase.TRAIT_ATTACK_TIMES;
                    trait.value = value;
                    break;
            }
        }
        else if(traitList[i].match(/(?:LVL|LEVEL)\s+(\d+)\s*:\s*(?:attack|atk)\s+state\s+(\d+)\s+(\d+)/i)){
            level = Math.max(1, parseInt(RegExp.$1));
            var state = parseInt(RegExp.$2);
            var rate = Math.max(0, parseInt(RegExp.$3));
            trait.code = Game_BattlerBase.TRAIT_ATTACK_STATE;
            trait.dataId = state;
            trait.value = rate;
        }
        if(level){
            traits[level] = traits[level] || [];
            traits[level].push(trait);
        }
    }
    return traits;
};


/**
 * Auxiliary function to parse Plugin Manager Data
 * 
 * @static
 * @method parsePMData
 */
TAA.el.alias.EnemyDataManager.parsePMData = EnemyDataManager.parsePMData;
EnemyDataManager.parsePMData = function(dataInput){
    try{
        var data = JSON.parse(dataInput);
    } catch(e){
        console.error("TAA_EnemyLevels: Failed to parse plugin manager data.");
        return null;
    }
    if(!data || Object.keys(data).length <= 0) return null;
    var enemyData = {};
    if(!data[this._idObject]){
        return null;
    }
    else{
        var id = data[this._idObject];
        if($taaEnemyData[id])
            enemyData = $taaEnemyData[id];
        else
            enemyData[this._idObject] = parseInt(data[this._idObject]);
    }
    
    if(!isNaN(data[this._classObject]) && data[this._classObject] > 0)
        enemyData[this._classObject] = data[this._classObject];
    else{
        enemyData[this._mhpObject] = data[this._mhpObject];
        enemyData[this._mmpObject] = data[this._mmpObject];
        enemyData[this._atkObject] = data[this._atkObject];
        enemyData[this._defObject] = data[this._defObject];
        enemyData[this._matObject] = data[this._matObject];
        enemyData[this._mdfObject] = data[this._mdfObject];
        enemyData[this._agiObject] = data[this._agiObject];
        enemyData[this._lukObject] = data[this._lukObject];
    }
    if(data[this._expObject])
        enemyData[this._expObject] = data[this._expObject];
    enemyData[this._goldObject] = data[this._goldObject];
    enemyData[this._showLevelObject] = data[this._showLevelObject] === 'true';
    enemyData[this._preserveStatsObject] = data[this._preserveStatsObject] === 'true';
    enemyData[this._resistChangeObject] = !isNaN(data[this._resistChangeObject]) ? parseInt(data[this._resistChangeObject]) : 0;
    enemyData[this._battlerArrayObject] = [];
    if(data[this._battlerArrayObject] !== undefined) {
        var array = JSON.parse(data[this._battlerArrayObject]);
        for(var i=0; i<array.length; i++){
            var obj = {};
            obj = JSON.parse(array[i]);
            if(i === 0 || enemyData[this._battlerArrayObject][i-1][this._battlerLevelObject] <= obj[this._battlerLevelObject]) {
                enemyData[this._battlerArrayObject].push(obj);
            }
            else {
                var index = this.getOrderedBattlerIndex(enemyData[this._battlerArrayObject], obj);
                enemyData[this._battlerArrayObject].splice(index, 0, obj);
            }
        }
    }
    if(data[this._traitsObject] && data[this._traitsObject].length > 0){
        enemyData[this._traitsObject] = {};
        enemyData[this._traitsObject] = this.parseTraitTag(data[this._traitsObject]);
    }
    return enemyData;
};

/**
 * Auxiliary function to reorder enemy data loaded through a JSON file
 * 
 * @static
 * @method reorderJsonData
 */
EnemyDataManager.reorderJsonData = function(){
    var orderedArray = [];
    if($taaEnemyData === undefined || $taaEnemyData === null || $taaEnemyData.length === 0)
        return;
    
    for(var i=0; i< $taaEnemyData.length; i++){
        if($taaEnemyData[i] !== undefined && $taaEnemyData[i][this._idObject] !== undefined){
            var id = $taaEnemyData[i][this._idObject];

            if(orderedArray[id] !== undefined) 
                console.error("Duplicated ID: " + id + ". Keeping the first entry.");
            else {
                var data = $taaEnemyData[i];
                var battlers = data[this._battlerArrayObject];
                if(battlers !== undefined && battlers.length > 0){
                    var a = [];
                    for(var j=0; j<battlers.length; j++){
                        var obj = battlers[j];
                        if(j === 0 || a[j-1][this._battlerLevelObject] <= obj[this._battlerLevelObject]) {
                            a.push(obj);
                        }
                        else {
                            var index = this.getOrderedBattlerIndex(a, obj);
                            a.splice(index, 0, obj);
                        }
                    }
                    data[this._battlerArrayObject] = a;
                }
                if(data[this._traitsObject] && data[this._traitsObject].length > 0){
                    var traits = {};
                    traits = this.parseTraitTag(data[this._traitsObject]);
                    data[this._traitsObject] = traits;
                }
                orderedArray[id] = data;
            }
        }
    }
    $taaEnemyData = orderedArray.slice();
};

/**
 * Return a normalized object, for ease of use
 * 
 * @static
 * @method getNormalizedData
 */
TAA.el.alias.EnemyDataManager.getNormalizedData = EnemyDataManager.getNormalizedData;
if(TAA.el.alias.EnemyDataManager.getNormalizedData === undefined) {
    EnemyDataManager.getNormalizedData = function(enemyId){
        var rawData = this.getEnemyData(enemyId);
        return this.prepareNormalizedObject(rawData);
    };
}

/**
 * Returns enemy level data with no normalization
 * 
 * @static
 * @method getEnemyData
 */
TAA.el.alias.EnemyDataManager.getEnemyData = EnemyDataManager.getEnemyData;
if(TAA.el.alias.EnemyDataManager.getEnemyData === undefined){
    EnemyDataManager.getEnemyData = function(enemyId){
        if($taaEnemyData[enemyId] !== null && $taaEnemyData[enemyId] !== undefined) return $taaEnemyData[enemyId];
        return this.getDefaultSettings(enemyId);
    };
};

/**
 * Returns default enemy level settings
 * 
 * @static
 * @method getDefaultSettings
 */
TAA.el.alias.EnemyDataManager.getDefaultSettings = EnemyDataManager.getDefaultSettings;
EnemyDataManager.getDefaultSettings = function(enemyId){
    var data = {};
    if(TAA.el.alias.EnemyDataManager.getDefaultSettings !== undefined)
        data = TAA.el.alias.EnemyDataManager.getDefaultSettings.call(this, enemyId);
    data[this._idObject] = enemyId;
    if(!isNaN(TAA.el.Parameters.Default.class) && TAA.el.Parameters.Default.class > 0)
        data[this._classObject] = TAA.el.Parameters.Default.class;
    else{
        data[this._mhpObject] = TAA.el.Parameters.Default.mhp;
        data[this._mmpObject] = TAA.el.Parameters.Default.mmp;
        data[this._atkObject] = TAA.el.Parameters.Default.atk;
        data[this._defObject] = TAA.el.Parameters.Default.def;
        data[this._matObject] = TAA.el.Parameters.Default.mat;
        data[this._mdfObject] = TAA.el.Parameters.Default.mdf;
        data[this._agiObject] = TAA.el.Parameters.Default.agi;
        data[this._lukObject] = TAA.el.Parameters.Default.luk;
    }
    data[this._expObject] = TAA.el.Parameters.Default.exp;
    data[this._goldObject] = TAA.el.Parameters.Default.gold;
    return data;
};

/**
 * Prepares a normalized enemy level object
 * 
 * @static
 * @method prepareNormalizedObject
 */
TAA.el.alias.EnemyDataManager.prepareNormalizedObject = EnemyDataManager.prepareNormalizedObject;
EnemyDataManager.prepareNormalizedObject = function(rawData){
    var data = {};
    if(TAA.el.alias.EnemyDataManager.prepareNormalizedObject !== undefined)
        data = TAA.el.alias.EnemyDataManager.prepareNormalizedObject.call(this, rawData);
    data['id'] = rawData[this._idObject];
    if(rawData[this._classObject])
        data['class'] = rawData[this._classObject];
    else {
        data['mhp'] = rawData[this._mhpObject];
        data['mmp'] = rawData[this._mmpObject];
        data['atk'] = rawData[this._atkObject];
        data['def'] = rawData[this._defObject];
        data['mat'] = rawData[this._matObject];
        data['mdf'] = rawData[this._mdfObject];
        data['agi'] = rawData[this._agiObject];
        data['luk'] = rawData[this._lukObject];
        data['paramList'] = [data['mhp'], data['mmp'], data['atk'], data['def'], data['mat'], data['mdf'], data['agi'], data['luk']];
    }
    if(rawData[this._expObject])
        data['exp'] = rawData[this._expObject];
    data['gold'] = rawData[this._goldObject];
    if(rawData[this._showLevelObject] !== undefined) data['showLevel'] = rawData[this._showLevelObject];
    if(rawData[this._preserveStatsObject] !== undefined) data['preserve'] = rawData[this._preserveStatsObject];
    if(!isNaN(rawData[this._resistChangeObject])) data['resist'] = rawData[this._resistChangeObject];
    var battlerData = rawData[this._battlerArrayObject];
    if(battlerData !== undefined && battlerData.length > 0){
        data['battler'] = [];
        for(var i=0; i<battlerData.length; i++){
            data['battler'][i] = {};
            if(isNaN(battlerData[i][this._battlerLevelObject])) continue;
            data['battler'][i].level = parseInt(battlerData[i][this._battlerLevelObject]);
            if(battlerData[i][this._battlerNameObject] !== undefined)
                data['battler'][i].battlerName = battlerData[i][this._battlerNameObject];
            if(!isNaN(battlerData[i][this._battlerHueObject]))
                data['battler'][i].battlerHue = parseInt(battlerData[i][this._battlerHueObject]);
            if(battlerData[i][this._battlerEnemyNameObject] !== undefined && battlerData[i][this._battlerEnemyNameObject] !== "")
                data['battler'][i].name = battlerData[i][this._battlerEnemyNameObject];
        }
    }
    if(rawData[this._traitsObject])
        data['traits'] = rawData[this._traitsObject];
    return data;
};

/**
 * Returns a specific param formula
 * 
 * @static
 * @method getParamFormula
 */
EnemyDataManager.getParamFormula = function(enemyId, param){
    var data = this.getEnemyData(enemyId);
    if(data === null || data === undefined) return undefined;
    switch(param){
        case 0:
        case 'mhp':
            return data[this._mhpObject];
        case 1:
        case 'mmp':
            return data[this._mmpObject];
        case 2:
        case 'atk':
            return data[this._atkObject];
        case 3:
        case 'def':
            return data[this._defObject];
        case 4:
        case 'mat':
            return data[this._matObject];
        case 5:
        case 'mdf':
            return data[this._mdfObject];
        case 6:
        case 'agi':
            return data[this._agiObject];
        case 7:
        case 'luk':
            return data[this._lukObject];
        default:
            return undefined;
    }
};

/**
 * Translates the param name to its id in the paramList array
 * 
 * @static
 * @method getParamIdFromName
 */
EnemyDataManager.getParamIdFromName = function(name){
    if(name.toLowerCase() === 'mhp') return 0;
    if(name.toLowerCase() === 'mmp') return 1;
    if(name.toLowerCase() === 'atk') return 2;
    if(name.toLowerCase() === 'def') return 3;
    if(name.toLowerCase() === 'mat') return 4;
    if(name.toLowerCase() === 'mdf') return 5;
    if(name.toLowerCase() === 'agi') return 6;
    if(name.toLowerCase() === 'luk') return 7;
    if(name.toLowerCase() === 'hit') return 0;
    if(name.toLowerCase() === 'eva') return 1;
    if(name.toLowerCase() === 'cri') return 2;
    if(name.toLowerCase() === 'cev') return 3;
    if(name.toLowerCase() === 'mrf') return 4;
    if(name.toLowerCase() === 'cnt') return 5;
    if(name.toLowerCase() === 'hrg') return 6;
    if(name.toLowerCase() === 'mrg') return 8;
    if(name.toLowerCase() === 'trg') return 9;
    if(name.toLowerCase() === 'tgr') return 0;
    if(name.toLowerCase() === 'grd') return 1;
    if(name.toLowerCase() === 'rec') return 2;
    if(name.toLowerCase() === 'pha') return 3;
    if(name.toLowerCase() === 'mcr') return 4;
    if(name.toLowerCase() === 'tcr') return 5;
    if(name.toLowerCase() === 'pdr') return 6;
    if(name.toLowerCase() === 'mdr') return 7;
    if(name.toLowerCase() === 'fdr') return 8;
    if(name.toLowerCase() === 'exr') return 9;
    return undefined;
};

/**
 * Parse enemy notes looking for any enemy level related tags
 * 
 * @static
 * @method parseEnemyLevelNotes
 */
EnemyDataManager.parseEnemyLevelNotes = function(enemyId){
    if($dataEnemies[enemyId] === undefined) return undefined;
    var note = $dataEnemies[enemyId].note;
    if(note === undefined) return undefined;
    var lines = note.split(/[\r\n]+/);
    var data = {};
    var multiLine = false;
    for(var i=0; i < lines.length; i++){
        if(lines[i].match(/<TAA_EL>/i)){
            multiLine = true;
        }
        else if(lines[i].match(/<\/TAA_EL>/i)){
            multiLine = false;
        }
        else if(multiLine){
            data = this.parseMultiLineLevelData(lines[i], data);
        }
        else {
            data = this.parseSingleLineLevelData(lines[i], data);
        }
    }
    if(data.traits && data.traits.length > 0){
        var traits = this.parseTraitTag(data.traits);
        data.traits = traits;
    }
    return Object.keys(data).length === 0 ? undefined : data;
};

/**
 * Specific parsing for multi line tags
 * 
 * @static
 * @method parseMultiLineLevelData
 */
EnemyDataManager.parseMultiLineLevelData = function(line, data){
    if(line.match(/CLASS\s*=\s*(\d+)/i)){
        var classId = parseInt(RegExp.$1);
        if(classId > 0){
            data.class = classId;
        }
    }
    else if(line.match(/(MHP|MMP|ATK|DEF|MAT|MDF|AGI|LUK|EXP|GOLD)\s*=\s*(.+)/i)){
        var param = RegExp.$1.toLowerCase();
        var formula = RegExp.$2;
        if(formula !== ""){
            data[param] = formula;
        }
    }
    else if(line.match(/SHOW\s*LEVEL\s*=\s*(TRUE|FALSE)/i)){
        var param = 'showLevel';
        var value = (RegExp.$1).toLowerCase() === 'true';
        data[param] = value;
    }
    else if(line.match(/PRESERVE\s*STATS\s*=\s*(TRUE|FALSE)/i)){
        var param = 'preserve';
        var value = (RegExp.$1).toLowerCase() === 'true';
        data[param] = value;
    }
    else if(line.match(/RESIST\s*=\s*(\d+)/i)){
        var param = 'resist';
        var value = parseInt(RegExp.$1);
        if(value > 100) value = 100;
        data[param] = value;
    }
    else if(line.match(/BATTLER:\s*(\d+)\s*,\s*([^,]*)\s*,\s*(\d*)/i)){
        var obj = {};
        obj['level'] = parseInt(RegExp.$1);
        var battlerName = RegExp.$2;
        if(battlerName !== undefined && battlerName !== "")
            obj['battlerName'] = battlerName;
        var battlerHue = RegExp.$3;
        if(!isNaN(battlerHue))
            obj['battlerHue'] = parseInt(battlerHue);
        if(data['battler'] === undefined) data['battler'] = [];
        var index = this.getOrderedBattlerIndex(data['battler'], obj);
        data['battler'].splice(index, 0, obj);
    }
    else if(line.match(/(?:LEVEL|LVL)\s+\d+\s*:\s*.+/i)){
        data.traits = data.traits || [];
        data.traits.push(line);
    }
    return data;
};

/**
 * Specific parsing for single line tags
 * 
 * @static
 * @method parseSingleLineLevelData
 */
EnemyDataManager.parseSingleLineLevelData = function(line, data){
    if(line.match(/<TAA_EL:\s*CLASS\s*=\s*(\d+)\s*>/i)){
        var classId = parseInt(RegExp.$1);
        if(classId > 0)
            data.class = classId;
    }
    else if(line.match(/<TAA_EL:\s*(MHP|MMP|ATK|DEF|MAT|MDF|AGI|LUK|EXP|GOLD)\s*=\s*(.+)\s*>/i)){
        var param = RegExp.$1.toLowerCase();
        var formula = RegExp.$2;
        if(formula !== ""){
            data[param] = formula;
        }
    }
    else if(line.match(/<TAA_EL:\s*SHOW\s*LEVEL\s*=\s*(TRUE|FALSE)\s*>/i)){
        var param = 'showLevel';
        var value = (RegExp.$1).toLowerCase() === 'true';
        data[param] = value;
    }
    else if(line.match(/<TAA_EL:\s*PRESERVE\s*STATS\s*=\s*(TRUE|FALSE)\s*>/i)){
        var param = 'preserve';
        var value = (RegExp.$1).toLowerCase() === 'true';
        data[param] = value;
    }
    else if(line.match(/<TAA_EL:\s*RESIST\s*=\s*(\d+)\s*>/i)){
        var param = 'resist';
        var value = parseInt(RegExp.$1);
        if(value > 100) value = 100;
        data[param] = value;
    }
    else if(line.match(/<TAA_EL:\s*BATTLER\s*=\s*(\d+)\s*,\s*([^,]*)\s*,\s*(\d*)\s*>/i)){
        var obj = {};
        obj['level'] = parseInt(RegExp.$1);
        var battlerName = RegExp.$2;
        if(battlerName !== undefined && battlerName !== "")
            obj['battlerName'] = battlerName;
        var battlerHue = RegExp.$3;
        if(!isNaN(battlerHue))
            obj['battlerHue'] = parseInt(battlerHue);
        else if(battlerName === undefined) return data;
        if(data['battler'] === undefined) data['battler'] = [];
        var index = this.getOrderedBattlerIndex(data['battler'], obj);
        data['battler'].splice(index, 0, obj);
    }
    else if(line.match(/<TAA_EL:\s*((?:LEVEL|LVL)\s+\d+\s*:\s*.+)>/i)){
        data.traits = data.traits || [];
        data.traits.push(RegExp.$1);
    }
    return data;
};

/**
 * Auxiliary function to order battler image data
 * 
 * @static
 * @method getOrderedBattlerIndex
 */
EnemyDataManager.getOrderedBattlerIndex = function(data, obj){
    var j = 0;
    var found = false;
    while(j < data.length && !found){
        if(data[j][this._battlerLevelObject] > obj[this._battlerLevelObject]) {
            found = true;
        }
        else
            j++;
    }
    return j;
};

/**
 * Parse Map note tags that alter enemy level settings
 * 
 * @static
 * @method parseMapEnemyLevelSettings
 */
EnemyDataManager.parseMapEnemyLevelSettings = function(enemyId) {
    if($gameMap.mapId() === undefined || $gameMap.mapId() === 0) return;
        var notes = $dataMap.note.split(/[\r\n]+/);
        var levelRange = {};
        var pattern = "<TAA_EL: " + enemyId + " RANGE:\\s*(\\d+)\\s*-\\s*(\\d+)\\s*(?:CONDITION:\\s*(.+))?>";
        var reg = new RegExp(pattern, 'i');
        var i=0;
        var condResult = false;
        while(i < notes.length && !condResult){
            var line = notes[i];
            if(line.match(reg)){
                var lowerRange = RegExp.$1;
                var upperRange = RegExp.$2;
                var condition = RegExp.$3;
                condResult = true;
                if(condition !== undefined && condition !== ""){
                    try{
                        var v = $gameVariables._data;
                        var s = $gameSwitches._data;
                        var a = this.getPartyEvalData();
                        var p = {};
                        p.avg = $gameParty.averageBattlerLevel();
                        p.max = $gameParty.highestBattlerLevel();
                        p.min = $gameParty.lowestBattlerLevel();
                        p.states = $gameParty.partyActiveStates();
                        condResult = (eval(condition)) === true;
                    } catch(e) {
                        console.error("TAA_EnemyLevels: invalid eval condition '" + condition + "'. Discarding note tags.");
                        condResult = false;
                    }
                }
                if(condResult === true){
                    if(!isNaN(lowerRange) && lowerRange > 0){
                        levelRange.lower = {};
                        levelRange.lower = parseInt(lowerRange);
                    }
                    if(!isNaN(upperRange) && upperRange > 0){
                        levelRange.upper = {};
                        levelRange.upper = parseInt(upperRange);
                    }
                }
            }
            i++;
        }
        if(Object.keys(levelRange).length > 0) return levelRange;
        return undefined;
};

/**
 * Create an object of party members data to use on map tags evaluation
 * 
 * @static
 * @method getPartyEvalData
 */
EnemyDataManager.getPartyEvalData = function(){
    var p = [];
    p[0] = {};
    p[0].level = $gameParty.leader().level;
    p[0].states = $gameParty.leader().states();
    var followers = $gamePlayer.followers();
    for(var i=0; i<followers.length; i++){
        p[i+1] = {};
        p[i+1].level = followers[i].level;
        p[i+1].states = followers[i].states();
    }
    return p;
};

/**
 * Apply modifiers to gold gained after battle
 * 
 * @static
 * @method applyGoldModifier
 */
EnemyDataManager.applyGoldModifier = function(gold){
    var troop = $gameTroop.deadMembers();
    switch(TAA.el.Parameters.Modifiers.Gold.toLowerCase()){
        case 'proportional to mob size':
            var mobSize = troop.length;
            gold = Math.round(gold * (mobSize * TAA.el.Parameters.Modifiers.MobEffect / 100 + 1));
            break;
        case 'proportional to average levels':
            var sum = 0;
            for(var i=0; i < troop.length; i++){
                sum += troop[i].getLevel();
            }
            var troopLevel = sum/troop.length;
            gold = Math.round(gold * troopLevel / $gameParty.averageBattlerLevel());
            break;
        case 'proportional to lowest levels':
            var troopLevel = Math.min.apply(null, troop.map(function(enemy) {
                return enemy.getLevel();
            }));
            gold = Math.round(gold * troopLevel / $gameParty.lowestBattlerLevel());
            break;
        case 'proportional to highest levels':
            var troopLevel = Math.max.apply(null, troop.map(function(enemy) {
                return enemy.getLevel();
            }));
            gold = Math.round(gold * troopLevel / $gameParty.highestBattlerLevel());
            break;
    }
    return gold;
};

/**
 * Apply modifiers to experience gained
 * 
 * @static
 * @method applyExperienceModifiers
 */
EnemyDataManager.applyExperienceModifiers = function() {
    var rewards = this.applyExperienceValueModifiers();
    return this.applyExperienceDistributionModifiers(rewards);
};

/**
 * Apply modifiers to experience value
 * 
 * @static
 * @method applyExperienceValueModifiers
 */
EnemyDataManager.applyExperienceValueModifiers = function() {
    var troop = $gameTroop.deadMembers();
    var rewards = {};
    rewards._exp = 0;
    rewards._partyExp = [];
    switch(TAA.el.Parameters.Modifiers.ExpValue.toLowerCase()){
        case 'proportional to mob size':
            var exp = $gameTroop.expTotal();
            var mobSize = troop.length;
            rewards._exp = Math.round(exp * (mobSize * TAA.el.Parameters.Modifiers.MobEffect / 100 + 1));
            break;
        case 'proportional to average levels':
            var exp = $gameTroop.expTotal();
            var sum = 0;
            for(var i=0; i < troop.length; i++){
                sum += troop[i].getLevel();
            }
            var troopLevel = sum/troop.length;
            rewards._exp = Math.round(exp * troopLevel/$gameParty.averageBattlerLevel());
            break;
        case 'proportional to lowest levels':
            var exp = $gameTroop.expTotal();
            var troopLevel = Math.min.apply(null, troop.map(function(enemy) {
                return enemy.getLevel();
            }));
            rewards._exp = Math.round(exp * troopLevel/$gameParty.lowestBattlerLevel());
            break;
        case 'proportional to highest levels':
            var exp = $gameTroop.expTotal();
            var troopLevel = Math.max.apply(null, troop.map(function(enemy) {
                return enemy.getLevel();
            }));
            rewards._exp = Math.round(exp * troopLevel/$gameParty.highestBattlerLevel());
            break;
        case 'proportional to exact levels':
            var party = $gameParty.battleMembers();
            var sum = 0;
            for(var i=0; i<party.length; i++){
                var exp = 0;
                for(var j=0; j<troop.length; j++){
                    exp += Math.round(troop[j].exp() * troop[j].getLevel()/party[i].level);
                }
                rewards._partyExp[i] = exp;
                sum += exp;
            }
            rewards._exp = Math.round(sum / party.length);
            break;
        case 'none':
        default:
            rewards._exp = $gameTroop.expTotal();
    }
    return rewards;
};

/**
 * Apply modifiers to how experience is distributed to the party
 * 
 * @static
 * @method applyExperienceDistributionModifiers
 */
EnemyDataManager.applyExperienceDistributionModifiers = function(rewards) {
    var party = $gameParty.battleMembers();
    switch(TAA.el.Parameters.Modifiers.ExpDistribution.toLowerCase()){
        case 'divide by alive members':
            var members = [];
            var exp = 0;
            var pSize = rewards._partyExp.length;
            for(var i=0; i<party.length; i++){
                if(party[i].isAlive()) {
                    members.push(i);
                    exp += rewards._partyExp[i];
                }
                else rewards._partyExp[i] = 0;
            }
            if(pSize > 0){
                rewards._exp = exp;
            }
            else if(rewards._exp > 0){
                exp = Math.round(rewards._exp / members.length);
                
                for(var i=0; i<party.length; i++){
                    if(isNaN(rewards._partyExp[i])) rewards._partyExp[i] = 0;
                    if(members.contains(i))
                        rewards._partyExp[i] = exp;
                }
            }
            break;
        case 'divide by all members':
            var pSize = rewards._partyExp.length;
            var exp = 0;
            if(pSize > 0){
                for(var i=0; i<party.length; i++){
                    if(isNaN(rewards._partyExp[i])) rewards._partyExp[i] = 0;
                    exp += rewards._partyExp[i];
                }
                rewards._exp = exp;
            }
            else{
                exp = Math.round(rewards._exp / party.length);
                for(var i=0; i<party.length; i++){
                    if(isNaN(rewards._partyExp[i])) rewards._partyExp[i] = 0;
                    rewards._partyExp[i] = exp;
                }
            }
            break;
        case 'same to alive members':
            var exp = rewards._exp;
            var partyExp = [];
            var alive = 0;
            for(var i=0; i<party.length; i++){
                if(party[i].isAlive()) {
                    alive++;
                    partyExp[i] = rewards._exp;
                }
                else
                    partyExp[i] = 0;
            }
            rewards._exp = exp * alive;
            rewards._partyExp = partyExp;
            break;
        case 'same to all members':
            var exp = rewards._exp;
            var i = 0;
            var partyExp = [];
            for(i=0; i<party.length; i++){
                partyExp[i] = rewards._exp;
            }
            rewards._exp = exp * i;
            rewards._partyExp = partyExp;
            break;
    }
    return rewards;
};


//=============================================================================
// BattleManager
//=============================================================================

TAA.el.alias.BattleManager = TAA.el.alias.BattleManager || {};
TAA.el.alias.BattleManager.makeRewards = BattleManager.makeRewards;
BattleManager.makeRewards = function(){
    TAA.el.alias.BattleManager.makeRewards.call(this);
    var rewards = EnemyDataManager.applyExperienceModifiers();
    this._rewards.exp = rewards._exp;
    this._rewards.partyExp = rewards._partyExp;
    var gold = EnemyDataManager.applyGoldModifier(this._rewards.gold);
    this._rewards.gold = gold;
};

TAA.el.alias.BattleManager.gainExp = BattleManager.gainExp;
BattleManager.gainExp = function() {
    if(TAA.el.Parameters.Modifiers.ExpDistribution === 'None' || TAA.el.Parameters.Modifiers.ExpDistribution === 'Same to All Members'){
        TAA.el.alias.BattleManager.gainExp.call(this);
    }
    else {
        var party = $gameParty.battleMembers();
        for(var i=0; i < party.length; i++){
            party[i].gainExp(this._rewards.partyExp[i]);
        }
    }
};

//=============================================================================
// Game_System
//=============================================================================

TAA.el.alias.Game_System = TAA.el.alias.Game_System || {};
TAA.el.alias.Game_System.initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function(){
    TAA.el.alias.Game_System.initialize.call(this);
    this.initEnemyLevelSettings();
};

Game_System.prototype.initEnemyLevelSettings = function(){
    this._elShowLevel = TAA.el.Parameters.ShowLevel;
    this._elNamePattern = TAA.el.Parameters.NameDisplay;
    this._elPreserveStats = TAA.el.Parameters.PreserveStats;
    this._elResistChange = TAA.el.Parameters.ResistChange;
    this._elDynamicRule = TAA.el.Parameters.DynamicLevels.Type;
    this._elNegativeRange = TAA.el.Parameters.DynamicLevels.NegativeRange;
    this._elPositiveRange = TAA.el.Parameters.DynamicLevels.PositiveRange;
};

Game_System.prototype.showEnemyLevel = function(){
    return this._elShowLevel;
};

Game_System.prototype.setShowEnemyLevel = function(state){
    this._elShowLevel = state === true;
};

Game_System.prototype.enemyLevelNamePattern = function(){
    return this._elNamePattern;
};

Game_System.prototype.enemyLevelPreserveStats = function(){
    return this._elPreserveStats;
};

Game_System.prototype.enemyLevelResistChange = function(){
    return this._elResistChange;
};

Game_System.prototype.enemyLevelRule = function(){
    return this._elDynamicRule;
};

Game_System.prototype.setEnemyLevelRule = function(rule){
    if(rule >=0 && rule <= 2) this._elDynamicRule = parseInt(rule);
};

Game_System.prototype.enemyLevelNegativeFluctuation = function(){
    return this._elNegativeRange;
};

Game_System.prototype.setNegativeRange = function(value, action){
    if(isNaN(value)) return;
    if(value < 0) value = 0;
    const oper = (action) ? action.toLowerCase() : undefined;
    if(['+', 'add', 'gain', 'increase'].contains(oper))
        this._elNegativeRange += parseInt(value);
    else if(['-', 'remove', 'lose', 'decrease'].contains(oper))
        this._elNegativeRange -= parseInt(value);
    else if(['*', 'multiply'].contains(oper))
        this._elNegativeRange = Math.round(this._elNegativeRange * parseInt(value));
    else if(['/', 'divide'].contains(oper))
        this._elNegativeRange = Math.round(this._elNegativeRange / parseInt(value));
    else if(action === undefined || ['=', 'set'].contains(oper))
        this._elNegativeRange = parseInt(value);
    this._elNegativeRange = Math.max(0, this._elNegativeRange);
};

Game_System.prototype.enemyLevelPositiveFluctuation = function(){
    return this._elPositiveRange;
};

Game_System.prototype.setPositiveRange = function(value, action){
    if(isNaN(value)) return;
    if(value < 0) value = 0;
    const oper = (action) ? action.toLowerCase() : undefined;
    if(['+', 'add', 'gain', 'increase'].contains(oper))
        this._elPositiveRange += parseInt(value);
    else if(['-', 'remove', 'lose', 'decrease'].contains(oper))
        this._elPositiveRange -= parseInt(value);
    else if(['*', 'multiply'].contains(oper))
        this._elPositiveRange = Math.round(this._elPositiveRange * parseInt(value));
    else if(['/', 'divide'].contains(oper))
        this._elPositiveRange = Math.round(this._elPositiveRange / parseInt(value));
    else if(action === undefined || ['=', 'set'].contains(oper))
        this._elPositiveRange = parseInt(value);
    this._elPositiveRange = Math.max(0, this._elPositiveRange);
};

Game_System.prototype.changeEnemyLevel = function(enemy, operation, level){
    if(isNaN(level)) return;
    if(!['=', '+', '-', '/', '*'].contains(operation)) operation = '=';
    var target;
    if(isNaN(enemy)){
        target = $gameTroop;
    }
    else{
        target = $gameTroop._enemies[enemy];
    }
    if(target === undefined) return;
    if(operation === '=') target.changeLevel(level);
    else if(operation === '+') target.gainLevel(level);
    else if(operation === '-') target.loseLevel(level);
    else if(operation === '*') target.multiplyLevel(level);
    else if(operation === '/') target.divideLevel(level);
};

Game_System.prototype.resetEnemyLevel = function(enemy){
    var target;
    if(isNaN(enemy)) target = $gameTroop;
    else target = $gameTroop._enemies[enemy];
    if(target === undefined) return;
    target.resetLevel();
}

//=============================================================================
// Game_Interpreter (MV)
//=============================================================================

TAA.el.alias.Game_Interpreter = TAA.el.alias.Game_Interpreter || {};
TAA.el.alias.Game_Interpreter.pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args){
    TAA.el.alias.Game_Interpreter.pluginCommand.call(this, command, args);
    if(command.toLowerCase() === 'enemylevel'){
        var operator;
        var enemy = args[0];
        if(isNaN(enemy) && !['troop', 'all'].contains(enemy.toLowerCase())){
            if(args[0].toLowerCase() === 'show') $gameSystem.setShowEnemyLevel(true);
            else if(args[0].toLowerCase() === 'hide') $gameSystem.setShowEnemyLevel(false);
            else if(args[0].toLowerCase() === 'rule'){
                if(args[1].toLowerCase() === 'lowest')
                    $gameSystem.setEnemyLevelRule(1);
                else if(args[1].toLowerCase() === 'highest')
                    $gameSystem.setEnemyLevelRule(2);
                else if(args[1].toLowerCase() === 'average')
                    $gameSystem.setEnemyLevelRule(0);
            }
            else if(args[0].toLowerCase() === 'lowerrange'){
                if(!isNaN(args[1])) $gameSystem.setNegativeRange(parseInt(args[1]));
                else if(args[1].match(/v\[(\d+)\]/i)){
                    var value = $gameVariables.value(RegExp.$1);
                    $gameSystem.setNegativeRange(value);
                }
            }
            else if(args[0].toLowerCase() === 'upperrange'){
                if(!isNaN(args[1])) $gameSystem.setPositiveRange(parseInt(args[1]));
                else if(args[1].match(/v\[(\d+)\]/i)){
                    var value = $gameVariables.value(RegExp.$1);
                    $gameSystem.setPositiveRange(value);
                }
            }
        }
        else {
            if(args[1].toLowerCase() === 'reset') $gameSystem.resetEnemyLevel(enemy);
            else if(['gain', 'increase', 'add', '+'].contains(args[1].toLowerCase())){
                operator = '+';
            }
            else if(['lose', 'decrease', 'remove', '-'].contains(args[1].toLowerCase())){
                operator = '-';
            }
            else if(['multiply', '*'].contains(args[1].toLowerCase())){
                operator = '*';
            }
            else if(['divide', '/'].contains(args[1].toLowerCase())){
                operator = '/';
            }
            else if(['set', '='].contains(args[1].toLowerCase())){
                operator = '=';
            }
            if(operator === undefined) return;
            if(!isNaN(args[2])){
                var value = args[2];
                $gameSystem.changeEnemyLevel(enemy, operator, value);
            }
        }
    }
};

//=============================================================================
// Plugin Commands (MZ)
//=============================================================================

if(Utils.RPGMAKER_NAME === 'MZ'){
    PluginManager.registerCommand(TAA.el.PluginName, 'enemyLevel', args => {
        const scope = args.scope;
        const enemyId = (isNaN(args.enemyId) || scope === 'Troop') ? undefined : parseInt(args.enemyId);
        if(isNaN(enemyId) && scope === 'Enemy') return;
        const action = args.action;
        const value = isNaN(args.value) ? 0 : parseInt(args.value);
        if(value === 0) return;
        $gameSystem.changeEnemyLevel(enemyId, action.replace(/'/g, ""), value);
    });

    PluginManager.registerCommand(TAA.el.PluginName, 'reset', args => {
        const scope = args.scope;
        const enemyId = (isNaN(args.enemyId) || scope === 'Troop') ? undefined : parseInt(args.enemyId);
        if(isNaN(enemyId) && scope === 'Enemy') return;
        $gameSystem.resetEnemyLevel(enemyId);
    });

    PluginManager.registerCommand(TAA.el.PluginName, 'range', args => {
        const type = args.type;
        const action = args.action;
        var value = isNaN(args.value) ? 0 : parseInt(args.value);
        const variable = args.var;
        if(variable !== undefined) value = $gameVariables.value(variable);
        if(value === 0) return;
        if(type === 'Lower Range') $gameSystem.setNegativeRange(value, action);
        else if(type === 'Upper Range') $gameSystem.setPositiveRange(value, action);
    });

    PluginManager.registerCommand(TAA.el.PluginName, 'showLevel', args => {
        const showLevel = args.action === true;
        $gameSystem.setShowEnemyLevel(showLevel);
    });

    PluginManager.registerCommand(TAA.el.PluginName, 'dynamicRule', args => {
        const rule = TAA.el.functions.getDynamicLevelType(args.rule);
        $gameSystem.setEnemyLevelRule(rule);
    });
}


//=============================================================================
// Game_Party
//=============================================================================

Game_Party.prototype.lowestBattlerLevel = function() {
    return Math.min.apply(null, this.battleMembers().map(function(actor) {
        return actor.level;
    }));
};

Game_Party.prototype.highestBattlerLevel = function() {
    return Math.max.apply(null, this.battleMembers().map(function(actor) {
        return actor.level;
    }));
};

Game_Party.prototype.averageBattlerLevel = function() {
    var sum = 0;
    var party = this.battleMembers();
    var size = party.length;
    for(var i=0; i < size; i++){
        sum += party[i].level;
    }
    return Math.round(sum/size);
};

Game_Party.prototype.partyActiveStates = function() {
    var list = [];
    var leader = this.leader();
    list = leader.states().slice();
    var followers = $gamePlayer.followers();
    for(var i=0; i<followers.length; i++){
        list = list.concat(followers[i].states());
    }
    return list;
};

//=============================================================================
// Game_Troop
//=============================================================================

TAA.el.alias.Game_Troop = TAA.el.alias.Game_Troop || {};
TAA.el.alias.Game_Troop.setup = Game_Troop.prototype.setup;
Game_Troop.prototype.setup = function(troopId) {
    TAA.el.alias.Game_Troop.setup.call(this, troopId);
    this._levelChangeBuffer = [];
    this._levelChangesTriggered = false;
};

Game_Troop.prototype.changeLevel = function(level){
    if(isNaN(level) || level <= 0) return;
    for(var i=0; i<this._enemies.length; i++){
        var enemy = this._enemies[i];
        if(!enemy.isAlive()) continue;
        enemy.changeLevel(level);
    }
};

Game_Troop.prototype.gainLevel = function(levels){
    if(isNaN(levels) || levels === 0) return;
    for(var i=0; i<this._enemies.length; i++){
        var enemy = this._enemies[i];
        if(!enemy.isAlive()) continue;
        enemy.gainLevel(levels);
    }
};

Game_Troop.prototype.loseLevel = function(levels){
    if(isNaN(levels) || levels === 0) return;
    for(var i=0; i<this._enemies.length; i++){
        var enemy = this._enemies[i];
        if(!enemy.isAlive()) continue;
        enemy.loseLevel(levels);
    }
};

Game_Troop.prototype.multiplyLevel = function(rate){
    if(isNaN(rate) || rate <= 0) return;
    for(var i=0; i<this._enemies.length; i++){
        var enemy = this._enemies[i];
        if(!enemy.isAlive()) continue;
        enemy.multiplyLevel(rate);
    }
};

Game_Troop.prototype.divideLevel = function(rate){
    if(isNaN(rate) || rate <= 0) return;
    for(var i=0; i<this._enemies.length; i++){
        var enemy = this._enemies[i];
        if(!enemy.isAlive()) continue;
        enemy.divideLevel(rate);
    }
};

Game_Troop.prototype.resetLevel = function(){
    for(var i=0; i<this._enemies.length; i++){
        var enemy = this._enemies[i];
        if(!enemy.isAlive()) continue;
        enemy.resetLevel();
    }
};

Game_Troop.prototype.clearLevelChanges = function(){
    this._levelChangeBuffer = [];
};

Game_Troop.prototype.saveLevelChanges = function(obj){
    this._levelChangeBuffer.push(obj);
};

Game_Troop.prototype.getLevelChanges = function(){
    return this._levelChangeBuffer;
};

Game_Troop.prototype.registerSuccessfulLevelChange = function(){
    this._levelChangesTriggered = true;
};

Game_Troop.prototype.hasSuccessfulLevelChange = function(){
    return this._levelChangesTriggered;
};

Game_Troop.prototype.clearSuccessfulLevelChange = function(){
    this._levelChangesTriggered = false;
};

//=============================================================================
// Game_Enemy
//=============================================================================

TAA.el.alias.Game_Enemy = TAA.el.alias.Game_Enemy || {};
TAA.el.alias.Game_Enemy.initMembers = Game_Enemy.prototype.initMembers;
Game_Enemy.prototype.initMembers = function(){
    TAA.el.alias.Game_Enemy.initMembers.call(this);
    this._level = 0;
    this._originalLevel = this._level;
    this._extData = {};
    this._elParamCache = {};
    this._originalBattlerName = "";
    this._originalBattlerHue = 0;
    this._allowedLevelChanges = 0;
    this._classId = 0;
};

TAA.el.alias.Game_Enemy.setup = Game_Enemy.prototype.setup;
Game_Enemy.prototype.setup = function(enemyId, x, y){
    this._level = this.setupEnemyLevel(enemyId);
    this._originalLevel = this._level;
    this._extData = this.setupExtendedData(enemyId);
    if(this._extData.class && this._extData.class > 0 && $dataClasses[this._extData.class])
        this._classId = this._extData.class;
    TAA.el.alias.Game_Enemy.setup.call(this, enemyId, x, y);
    this._originalBattlerName = this.battlerName();
    this._originalBattlerHue = this.battlerHue();
};

TAA.el.alias.Game_Enemy.allTraits = Game_Enemy.prototype.allTraits;
Game_Enemy.prototype.allTraits = function() {
    var traits = TAA.el.alias.Game_Enemy.allTraits.call(this);
    if(!this._extData) return traits;
    if(this._extData.class && this._extData.class > 0) traits = this.classTraits(traits);
    if(!this._extData.traits) return traits;
    return this.leveledTraits(traits);
    
};

Game_Enemy.prototype.classTraits = function(traitList){
    if(!this._extData || !this._extData.class || this._extData.class <= 0 || !$dataClasses[this._extData.class]) return traits;
    var allowedTraits = [
        Game_BattlerBase.TRAIT_ELEMENT_RATE, 
        Game_BattlerBase.TRAIT_DEBUFF_RATE, 
        Game_BattlerBase.TRAIT_STATE_RATE, 
        Game_BattlerBase.TRAIT_STATE_RESIST, 
        Game_BattlerBase.TRAIT_XPARAM, 
        Game_BattlerBase.TRAIT_SPARAM, 
        Game_BattlerBase.TRAIT_ATTACK_ELEMENT, 
        Game_BattlerBase.TRAIT_ATTACK_SPEED, 
        Game_BattlerBase.TRAIT_ATTACK_TIMES, 
        Game_BattlerBase.TRAIT_ATTACK_STATE
    ];
    var classTraits = $dataClasses[this._extData.class].traits;
    for(var i=0; i<classTraits.length; i++){
        if(allowedTraits.contains(classTraits[i].code)){
            var currentTraits = traitList.filter(function(trait) {
                return trait.code === classTraits[i].code && trait.dataId === classTraits[i].dataId;
            });
            if(!currentTraits || currentTraits.length <= 0){
                traitList.push(classTraits[i]);
            }
        }
    }
    return traitList;
};

Game_Enemy.prototype.leveledTraits = function(traitList){
    if(!this._extData || !this._extData.traits) return traitList;
    var keys = Object.keys(this._extData.traits);
    for(var i=0; i<keys.length; i++){
        if(this._level < keys[i]) i += keys.length;
        var objList = this._extData.traits[keys[i]] || [];
        for(var j=0; j<objList.length; j++){
            var currentTraits = traitList.filter(function(trait) {
                return trait.code === objList[j].code && trait.dataId === objList[j].dataId;
            });
            if(!currentTraits || currentTraits.length <= 0){
                traitList.push(objList[j]);
            }
            else{
                if(objList[j].value)
                    currentTraits[0].value = objList[j].value;
            }
        }
    }
    return traitList;
};

Game_Enemy.prototype.clearParamCache = function(){
    var mhp = this._elParamCache["0"] || this._elParamCache['mhp'];
    var mmp = this._elParamCache["1"] || this._elParamCache['mmp'];
    this._elParamCache = {};
    if(this.preserveStats()){
        this._elParamCache["0"] = mhp;
        this._elParamCache['mhp'] = mhp;
        this._elParamCache["1"] = mmp;
        this._elParamCache['mmp'] = mmp;
    }
};

Game_Enemy.prototype.getClassData = function(){
    if(!this._classId || this._classId === 0) return undefined;
    return $dataClasses[this._classId];
};

Game_Enemy.prototype.setupExtendedData = function(enemyId){
    var data = EnemyDataManager.getNormalizedData(enemyId);
    var customData = EnemyDataManager.parseEnemyLevelNotes(enemyId);
    if(customData !== undefined){
        var keys = Object.keys(customData);
        if(keys.contains('class')) data = this.clearNonClassExtData(data);
        for(var i=0; i < keys.length; i++){
            var key = keys[i];
            data[key] = customData[key];
            var paramId = EnemyDataManager.getParamIdFromName(key);
            if(!isNaN(paramId))
                data.paramList[paramId] = customData[key];
        }
    }
    return data;
};

Game_Enemy.prototype.clearNonClassExtData = function(data){
    delete data.mhp;
    delete data.mmp;
    delete data.atk;
    delete data.def;
    delete data.mat;
    delete data.mdf;
    delete data.agi;
    delete data.luk;
    delete data.exp;
    delete data.paramList;
    return data;
};

TAA.el.alias.Game_Enemy.paramBase = Game_Enemy.prototype.paramBase;
Game_Enemy.prototype.paramBase = function(paramId){
    if(!isNaN(this._elParamCache[paramId])) return this._elParamCache[paramId];
    var clss = this.getClassData();
    if(clss) return this.paramBaseByClass(clss, paramId);
    var base = TAA.el.alias.Game_Enemy.paramBase.call(this, paramId);
    var paramValue = this.evalParamLevel(paramId, base);
    if(paramValue === undefined || paramValue < 0){
        paramValue = base;
    }
    this._elParamCache[paramId] = paramValue;
    return paramValue;
};

Game_Enemy.prototype.paramBaseByClass = function(classData, paramId){
    var paramValue = classData.params[paramId][this.getLevel()];
    this._elParamCache[paramId] = paramValue;
    return paramValue;
};

Game_Enemy.prototype.setupEnemyLevel = function(enemyId){
    var mod = 0;
    if(TAA.el.Parameters.Variables.Modifier > 0){
        mod = $gameVariables.value(TAA.el.Parameters.Variables.Modifier);
        if(mod < 0) mod = 0;
    }
    // 1st priority: get level from map tags
    var levelRange = EnemyDataManager.parseMapEnemyLevelSettings(enemyId);
    if(levelRange !== undefined){
        return mod + this.randomLevel(levelRange.lower, levelRange.upper);
    }
    // 2nd priority: get level from variables
    if(TAA.el.Parameters.Variables.ManualLower > 0 && TAA.el.Parameters.Variables.ManualUpper > 0){
        var min = $gameVariables.value(TAA.el.Parameters.Variables.ManualLower);
        var max = $gameVariables.value(TAA.el.Parameters.Variables.ManualUpper);
        if(min > 0 && max >= min)
            return mod + this.randomLevel(min, max);
    }

    // 3rd priority: get level from dynamic global rule
    return mod + this.setupDynamicLevel();
};

Game_Enemy.prototype.setupDynamicLevel = function(){
    var rule = $gameSystem.enemyLevelRule();
    var seed = 1;
    switch(rule){
        case 1:
            seed = $gameParty.lowestBattlerLevel();
            break;
        case 2:
            seed = $gameParty.highestBattlerLevel();
            break;
        case 0:
        default:
            seed = $gameParty.averageBattlerLevel();
    }
    var min = Math.max(1, seed - $gameSystem.enemyLevelNegativeFluctuation());
    var max = seed + $gameSystem.enemyLevelPositiveFluctuation();
    var level = this.randomLevel(min, max);
    return level;
};

Game_Enemy.prototype.randomLevel = function(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

Game_Enemy.prototype.getParamFormula = function(paramId){
    if(this._extData === undefined || this._extData.paramList === undefined || this._extData.paramList[paramId] === undefined) return null;
    return this._extData.paramList[paramId];
};

Game_Enemy.prototype.evalParamLevel = function(paramId, base){
    var formula = undefined;
    formula = this.getParamFormula(paramId);
    if(formula === null || formula === "") return undefined;
    var value = this.evalLevelFormula(formula, base);
    if(isNaN(value)) return undefined;
    return value;
};

Game_Enemy.prototype.level = function(){
    return this._level;
};

Game_Enemy.prototype.getLevel = function(){
    return this._level;
};

Game_Enemy.prototype.isCurrentLevel = function(level){
    return this._level === level;
};

Game_Enemy.prototype.originalLevel = function(){
    return this._originalLevel;
};

Game_Enemy.prototype.showLevel = function(){
    if(this._extData !== undefined && this._extData.showLevel !== undefined){
        return this._extData.showLevel === true;
    }
    return $gameSystem.showEnemyLevel();
};

TAA.el.alias.Game_Enemy.name = Game_Enemy.prototype.name;
Game_Enemy.prototype.name = function(){
    var name = this.currentName();
    if(this.showLevel()){
        var str = $gameSystem.enemyLevelNamePattern();
        var letter = (this._plural) ? this._letter.replace(/\s*/, '') : "";
        var result = str.format(name, this.getLevel(), letter);
        return result;
    }
    else
        return name;
};

Game_Enemy.prototype.currentName = function(){
    var name = (this.showLevel()) ? this.originalName() : TAA.el.alias.Game_Enemy.name.call(this);
    if(this._extData === undefined || this._extData.battler === undefined || this._extData.battler.length <= 0) return name;

    var i = 0;
    var found = false;
    while(i < this._extData.battler.length && !found){
        if(this._level < this._extData.battler[i].level) found = true;
        else if(this._extData.battler[i].name !== undefined && this._extData.battler[i].name !== ""){
            name = this._extData.battler[i].name;
        }
        i++;
    }

    return name;
};

Game_Enemy.prototype.preserveStats = function(){
    if(this._extData !== undefined && this._extData.preserve !== undefined){
        return this._extData.preserve === true;
    }
    return $gameSystem.enemyLevelPreserveStats();
};

Game_Enemy.prototype.resistLevelChange = function(){
    var resistance = this.levelChangeResistance();
    var chance = Math.random() * 100;
    if(chance > resistance) return false;
    else return true;
};

Game_Enemy.prototype.levelChangeResistance = function(){
    var resistance = 0;
    if(!isNaN(this._elParamCache['resist']))
        resistance = this._elParamCache['resist'];
    else if(this._extData !== undefined && !isNaN(this._extData.resist)){
        resistance = parseInt(this._extData.resist);
        this._elParamCache['resist'] = resistance;
    }
    else{
        resistance = $gameSystem.enemyLevelResistChange();
        this._elParamCache['resist'] = resistance;
    }
    return resistance;
};

Game_Enemy.prototype.expForLevel = function(level) {
    var c = this.getClassData();
    var basis = c.expParams[0];
    var extra = c.expParams[1];
    var acc_a = c.expParams[2];
    var acc_b = c.expParams[3];
    return Math.round(basis*(Math.pow(level-1, 0.9+acc_a/250))*level*
            (level+1)/(6+Math.pow(level,2)/50/acc_b)+(level-1)*extra);
};

TAA.el.alias.Game_Enemy.exp = Game_Enemy.prototype.exp;
Game_Enemy.prototype.exp = function() {
    var value = undefined;
    var base = TAA.el.alias.Game_Enemy.exp.call(this);
    if(this._extData !== undefined) {
        if(this._extData.exp !== undefined)
            value = this.evalLevelFormula(this._extData.exp, base);
        else if(this._extData.class){
            value = this.expForLevel(this.getLevel());
        }
    }
    if(value === undefined) value = base;
    return value;
};

TAA.el.alias.Game_Enemy.gold = Game_Enemy.prototype.gold;
Game_Enemy.prototype.gold = function(){
    var value = undefined;
    var base = TAA.el.alias.Game_Enemy.gold.call(this);
    if(this._extData !== undefined && this._extData.gold !== undefined){
        value = this.evalLevelFormula(this._extData.gold, base);
    }
    if(value === undefined) value = base;
    return value;
};

Game_Enemy.prototype.evalLevelFormula = function(formula, base){
    var value = undefined;
    var v = $gameVariables._data;
    var s = $gameSwitches._data;
    var a = this;
    var level = this.getLevel();
    try{
        value = Math.floor(eval(formula));
    } catch(e){
        console.error("TAA_EnemyLevels: error evaluating exp formula '" + formula + "'. Keeping fixed value.");
        value = undefined;
    }
    return value;
};

Game_Enemy.prototype.changeLevel = function(level) {
    var levelChanges = 0;
    if(!this.isCurrentLevel()){
        if(level > 0) {
            var oldLevel = this._level;
            this._level = Math.max(level, 1);
            levelChanges = Math.abs(this._level - oldLevel);
            this.clearParamCache();
            this.refresh();
        }
    }
    return levelChanges;
};

Game_Enemy.prototype.updateOriginalLevel = function(level){
    if(!this.isCurrentLevel() && level > 0){
        this._level = level;
        this._originalLevel = level;
        this._elParamCache = {};
        this.refresh();
    }
};

Game_Enemy.prototype.gainLevel = function(levels, force){
    if(isNaN(levels)) return;
    var levelChanges = force === true ? levels : this.checkAllowedLevelChanges(levels);
    if(levelChanges === 0) return 0;
    return this.changeLevel(this.getLevel() + parseInt(levelChanges));
};

Game_Enemy.prototype.loseLevel = function(levels, force){
    if(isNaN(levels)) return;
    var levelChanges = force === true ? levels : this.checkAllowedLevelChanges(levels);
    if(levelChanges === 0) return 0;
    return this.changeLevel(this.getLevel() - parseInt(levelChanges));
};

Game_Enemy.prototype.multiplyLevel = function(rate, force){
    if(isNaN(rate) || rate <= 0) return;
    var changeRate = force === true ? rate : parseInt(rate) * this.checkAllowedLevelChanges(1);
    if(changeRate === 0) return 0;
    return this.changeLevel(Math.max(Math.round(this.getLevel() * changeRate), 1));
};

Game_Enemy.prototype.divideLevel = function(rate, force){
    if(isNaN(rate) || rate <= 0) return;
    var changeRate = force === true ? rate : rate * this.checkAllowedLevelChanges(1);
    if(changeRate === 0) return 0;
    return this.changeLevel(Math.max(Math.round(this.getLevel() / changeRate), 1));
};

Game_Enemy.prototype.resetLevel = function(){
    this.changeLevel(this.originalLevel());
};

Game_Enemy.prototype.checkAllowedLevelChanges = function(n){
    var result = 0;
    for(var i=0; i<n; i++){
        if(!this.resistLevelChange())
            result++;
    }
    return result;
};

TAA.el.alias.Game_Enemy.battlerName = Game_Enemy.prototype.battlerName;
Game_Enemy.prototype.battlerName = function() {
    var name = TAA.el.alias.Game_Enemy.battlerName.call(this);
    if(this._extData === undefined || this._extData.battler === undefined || this._extData.battler.length <= 0) return name;

    var i = 0;
    var found = false;
    while(i < this._extData.battler.length && !found){
        if(this._level < this._extData.battler[i].level) found = true;
        else if(this._extData.battler[i].battlerName !== undefined && this._extData.battler[i].battlerName !== "" && this.battlerImgExists(this._extData.battler[i].battlerName)){
            name = this._extData.battler[i].battlerName;
        }
        i++;
    }

    return name;
};

Game_Enemy.prototype.battlerImgExists = function(file){
    if(file === "") return true;
    var fs = require('fs');
    var filePath = $gameSystem.isSideView() ? 'img/sv_enemies/' : 'img/enemies/';
    filePath += file + ".png"

    return fs.existsSync(filePath);
};

TAA.el.alias.Game_Enemy.battlerHue = Game_Enemy.prototype.battlerHue;
Game_Enemy.prototype.battlerHue = function(){
    var hue = TAA.el.alias.Game_Enemy.battlerHue.call(this);
    if(this._extData === undefined || this._extData.battler === undefined || this._extData.battler.length <= 0) return hue;
    var i = 0;
    var found = false;
    while(i < this._extData.battler.length && !found){
        if(this._level < this._extData.battler[i].level) found = true;
        else if(!isNaN(this._extData.battler[i].battlerHue)){
            hue = parseInt(this._extData.battler[i].battlerHue);
        }
        i++;
    }
    return hue;
};

//=============================================================================
// Game_Action
//=============================================================================

TAA.el.alias.GameAction = TAA.el.alias.GameAction || {};
TAA.el.alias.GameAction.setSkill = Game_Action.prototype.setSkill;
Game_Action.prototype.setSkill = function(skillId){
    TAA.el.alias.GameAction.setSkill.call(this, skillId);
    this.item()._changeEnemyLevel = undefined;
    this.processLevelChangeTags();
};

Game_Action.prototype.processLevelChangeTags = function(){
    var notes = this.item().note.split(/[\r\n]+/);
    if(notes === undefined || notes.length <= 0) return;

    var singleLinePattern = /<TAA_EL:\s*(\+|-|\*|\/)(\d+)\s*>/i;
    var i =0;
    var found = false;
    while(i < notes.length && !found){
        if(notes[i].match(singleLinePattern)){
            var obj = {};
            obj.op = RegExp.$1;
            obj.value = RegExp.$2;
            this.item()._changeEnemyLevel = obj;
            found = true;
        }
        i++;
    }
};

TAA.el.alias.GameAction.apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target){
    TAA.el.alias.GameAction.apply.call(this, target);
    if(target.isEnemy() && this.item()._changeEnemyLevel !== undefined)
        this.processLevelChangeEffects(target);
};

Game_Action.prototype.processLevelChangeEffects = function(target){
    var obj = this.item()._changeEnemyLevel;
    var result = {};
    result.id = target.enemyId();
    result.op = obj.op;
    result.previous = target.getLevel();
    result.value = 0;
    if(obj.op === '+') result.value = target.gainLevel(obj.value);
    else if(obj.op === '-') result.value = target.loseLevel(obj.value);
    else if(obj.op === '*') result.value = target.multiplyLevel(obj.value);
    else if(obj.op === '/') result.value = target.divideLevel(obj.value);
    result.newLevel = target.getLevel();
    
    $gameTroop.saveLevelChanges(result);
    if(result.value > 0) {
        $gameTroop.registerSuccessfulLevelChange();
        this.makeSuccess(target);
    }
};

//=============================================================================
// Window_BattleLog
//=============================================================================

TAA.el.alias.Window_BattleLog = TAA.el.alias.Window_BattleLog || {};
TAA.el.alias.Window_BattleLog.displayActionResults = Window_BattleLog.prototype.displayActionResults;
Window_BattleLog.prototype.displayActionResults = function(subject, target) {
    TAA.el.alias.Window_BattleLog.displayActionResults.call(this, subject, target);
    if(TAA.el.Parameters.BattleLog.Enabled === false) return;
    var changes = $gameTroop.getLevelChanges();
    if (target.result().used) {
        this.push('pushBaseLine');
        if(changes !== undefined && changes.length > 0){
            var test = changes.shift();
            this.displayLevelChangeResults(test);
        }
        else if($gameTroop.hasSuccessfulLevelChange()){
            this.displayLevelChangeFailed();
        }
        this.push('waitForNewLine');
        this.push('popBaseLine');
    }
};

Window_BattleLog.prototype.displayLevelChangeResults = function(obj){
    var msg = "";
    if(obj === undefined || obj.value <= 0) return;
    var name = $dataEnemies[obj.id].name;
    msg = TAA.el.Parameters.BattleLog.SingleMsg.format(name, obj.previous, obj.newLevel);
    this.push("addText", msg);
};

Window_BattleLog.prototype.displayLevelChangeFailed = function(){
    if(TAA.el.Parameters.BattleLog.FailedMsg.length > 0){
        this.push("addText", TAA.el.Parameters.BattleLog.FailedMsg);
    }
};