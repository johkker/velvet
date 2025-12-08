// TypeORM Best Practice for Relations:
// When you have @ManyToOne, you should NOT manually define the foreign key column
// TypeORM handles it automatically

// INCORRECT (what we currently have):
/*
@ManyToOne(() => Talent, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'talent_id' })
talent: Talent;

@Column({ name: 'talent_id' })  // <-- THIS IS THE PROBLEM
talentId: string;
*/

// CORRECT (what it should be):
/*
@ManyToOne(() => Talent, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'talent_id' })
talent: Talent;

// No talentId column needed! TypeORM creates it automatically
// But if you want to access the ID directly, use RelationId decorator:

@RelationId((entity: ClassName) => entity.talent)
talentId: string;
*/
