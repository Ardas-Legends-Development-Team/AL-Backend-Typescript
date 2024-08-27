import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { AbstractDomainEntity } from '@/domain/entities/AbstractDomainEntity';
import { InitialFaction } from '@/domain/entities/InitialFaction';
import { Player } from '@/domain/entities/Player';
import { Army } from '@/domain/entities/Army';
import { Region } from '@/domain/entities/Region';
import { ClaimBuild } from '@/domain/entities/ClaimBuild';

@Entity('factions')
export class Faction extends AbstractDomainEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name: string;

    @OneToOne(() => InitialFaction, { cascade: true })
    initialFaction: InitialFaction;

    @OneToOne(() => Player, { cascade: true })
    leader: Player;

    @OneToMany(() => Army, (army) => army.faction, { cascade: true })
    armies: Army[];

    @OneToMany(() => Player, (player) => player.faction, { cascade: true })
    players: Player[];

    @ManyToMany(() => Region, (region) => region.claimedBy, { cascade: true })
    regions: Set<Region>;

    @OneToMany(() => ClaimBuild, (claimBuild) => claimBuild.ownedBy, {
        cascade: true,
    })
    claimBuilds: ClaimBuild[];

    @ManyToMany(() => Faction, { cascade: true })
    @JoinTable({
        name: 'faction_allies',
        joinColumns: [{ name: 'faction', referencedColumnName: 'id' }],
        inverseJoinColumns: [
            { name: 'ally_faction', referencedColumnName: 'id' },
        ],
    })
    allies: Faction[];

    @Column()
    colorcode: string;

    @Column({ name: 'role_id', unique: true })
    factionRoleId: number;

    @OneToOne(() => Region, { cascade: true })
    homeRegion: Region;

    @Column({ length: 512 })
    factionBuffDescr: string;

    @Column({ name: 'food_stockpile', default: 0 })
    foodStockpile: number;

    @Column('simple-array')
    aliases: string[];

    constructor(
        name: string,
        leader: Player,
        armies: Army[],
        players: Player[],
        regions: Set<Region>,
        claimBuilds: ClaimBuild[],
        allies: Faction[],
        colorcode: string,
        homeRegion: Region,
        factionBuffDescr: string,
    ) {
        super();
        this.name = name;
        this.leader = leader;
        this.armies = armies;
        this.players = players;
        this.regions = regions;
        this.claimBuilds = claimBuilds;
        this.allies = allies;
        this.colorcode = colorcode;
        this.homeRegion = homeRegion;
        this.factionBuffDescr = factionBuffDescr;
        this.foodStockpile = 0;
        this.aliases = [];
    }

    addFoodToStockpile(amount: number): void {
        if (amount < 0) {
            throw FactionServiceException.negativeStockpileAddNotSupported();
        }
        this.foodStockpile += amount;
    }

    subtractFoodFromStockpile(amount: number): void {
        if (amount < 0) {
            throw FactionServiceException.negativeStockpileSubtractNotSupported();
        }
        if (this.foodStockpile - amount < 0) {
            throw FactionServiceException.notEnoughFoodInStockpile(
                this.name,
                this.foodStockpile,
                amount,
            );
        }
        this.foodStockpile -= amount;
    }

    equals(other: Faction): boolean {
        return this.name === other.name;
    }

    toString(): string {
        return this.name;
    }
}
