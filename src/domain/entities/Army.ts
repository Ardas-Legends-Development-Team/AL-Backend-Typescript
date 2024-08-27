import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { AbstractDomainEntity } from '@/domain/entities/AbstractDomainEntity';
import { ArmyType } from '@/domain/enums/ArmyType';
import { Faction } from '@/domain/entities/Faction';
import { Region } from '@/domain/entities/Region';
import { RPChar } from '@/domain/entities/RPChar';
import { Unit } from '@/domain/entities/Unit';
import { ClaimBuild } from '@/domain/entities/ClaimBuild';
import { Movement } from '@/domain/entities/Movement';
import { DateTime } from 'luxon';

@Entity('armies')
export class Army extends AbstractDomainEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name: string;

    @Column({ type: 'enum', enum: ArmyType, name: 'army_type' })
    armyType: ArmyType;

    @ManyToOne(() => Faction, { cascade: true })
    @JoinColumn({
        name: 'faction',
        foreignKeyConstraintName: 'fk_armies_faction',
    })
    faction: Faction;

    @ManyToOne(() => Region, { cascade: true })
    @JoinColumn({
        name: 'current_Region',
        foreignKeyConstraintName: 'fk_armies_current_region',
    })
    currentRegion: Region;

    @OneToOne(() => RPChar, { cascade: true })
    @JoinColumn({
        name: 'bound_to',
        foreignKeyConstraintName: 'fk_armies_bound_to',
    })
    boundTo: RPChar;

    @OneToMany(() => Unit, (unit) => unit.army, { cascade: true })
    units: Unit[];

    @Column('simple-array')
    sieges: string[];

    @ManyToOne(() => ClaimBuild, { cascade: true })
    @JoinColumn({
        name: 'stationed_at',
        foreignKeyConstraintName: 'fk_armies_stationed_at',
    })
    stationedAt: ClaimBuild;

    @Column()
    freeTokens: number;

    @Column({ default: false })
    isHealing: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    healStart: DateTime;

    @Column({ type: 'timestamptz', nullable: true })
    healEnd: DateTime;

    @Column({ nullable: true })
    hoursHealed: number;

    @Column({ nullable: true })
    hoursLeftHealing: number;

    @Column({ type: 'timestamptz', nullable: true })
    healLastUpdatedAt: DateTime;

    @ManyToOne(() => ClaimBuild, { cascade: true })
    @JoinColumn({
        name: 'origin_claimbuild',
        foreignKeyConstraintName: 'fk_armies_origin_claimbuild',
    })
    originalClaimbuild: ClaimBuild;

    @Column({ type: 'timestamptz' })
    createdAt: DateTime;

    @OneToMany(() => Movement, (movement) => movement.army, { cascade: true })
    movements: Movement[];

    @Column({ default: false })
    isPaid: boolean;

    constructor(
        name: string,
        armyType: ArmyType,
        faction: Faction,
        currentRegion: Region,
        boundTo: RPChar,
        units: Unit[],
        sieges: string[],
        stationedAt: ClaimBuild,
        freeTokens: number,
        isHealing: boolean,
        healStart: DateTime,
        healEnd: DateTime,
        hoursHealed: number,
        hoursLeftHealing: number,
        originalClaimbuild: ClaimBuild,
        createdAt: DateTime,
        isPaid: boolean,
    ) {
        super();
        this.name = name;
        this.armyType = armyType;
        this.faction = faction;
        this.currentRegion = currentRegion;
        this.boundTo = boundTo;
        this.units = units;
        this.sieges = sieges;
        this.stationedAt = stationedAt;
        this.freeTokens = freeTokens;
        this.isHealing = isHealing;
        this.healStart = healStart;
        this.healEnd = healEnd;
        this.hoursHealed = hoursHealed;
        this.hoursLeftHealing = hoursLeftHealing;
        this.originalClaimbuild = originalClaimbuild;
        this.createdAt = createdAt;
        this.isPaid = isPaid;
    }

    toString(): string {
        return this.name;
    }

    equals(other: Army): boolean {
        return this.name === other.name;
    }

    hashCode(): number {
        return this.name ? this.name.hashCode() : 0;
    }

    allUnitsAlive(): boolean {
        return this.units.every((unit) => unit.amountAlive === unit.count);
    }

    hasUnitsLeft(): boolean {
        return this.units.some((unit) => unit.amountAlive > 0);
    }

    getActiveMovement(): Optional<Movement> {
        return this.movements.find((movement) => movement.isCurrentlyActive);
    }

    getAmountOfHealHours(): number {
        const tokensMissing = this.units.reduce(
            (sum, unit) => sum + (unit.count - unit.amountAlive) * unit.cost,
            0,
        );
        let hoursHeal = (tokensMissing * 24) / 6;
        let divisor = 24;
        if (this.stationedAt.type === ClaimBuildType.STRONGHOLD) {
            hoursHeal /= 2;
            divisor = 12;
        }
        const intHoursHeal = Math.ceil(hoursHeal);
        const hoursLeftUntil24h = divisor - (intHoursHeal % divisor);
        return intHoursHeal + hoursLeftUntil24h;
    }

    resetHealingStats(): void {
        this.isHealing = false;
        this.healStart = null;
        this.healEnd = null;
        this.hoursHealed = 0;
        this.hoursLeftHealing = 0;
    }

    isYoungerThan24h(): boolean {
        return DateTime.now().isBefore(this.createdAt.plusHours(24));
    }
}
