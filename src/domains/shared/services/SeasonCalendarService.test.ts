import { describe, expect, it } from 'vitest';
import { SeasonCalendarService } from './SeasonCalendarService';

describe('SeasonCalendarService', () => {
    it('generates at least 5 nodes with a mix of match and rest', () => {
        // Seed 12345 produces a mix for the first 5-8 nodes
        const nodes = SeasonCalendarService.generateInitialCalendar(12345);
        
        expect(nodes.length).toBeGreaterThanOrEqual(5);
        
        const types = nodes.map(n => n.type);
        expect(types).toContain('match');
        expect(types).toContain('rest');
    });

    it('has exactly one current node', () => {
        const nodes = SeasonCalendarService.generateInitialCalendar();
        const currentCount = nodes.filter(n => n.status === 'current').length;
        expect(currentCount).toBe(1);
    });

    it('starts with the first node as current and no completed matches', () => {
        const nodes = SeasonCalendarService.generateInitialCalendar();
        expect(nodes[0].status).toBe('current');
        expect(nodes.filter(n => n.status === 'completed').length).toBe(0);
    });

    it('is deterministic for a given seed', () => {
        const seed = 12345;
        const nodes1 = SeasonCalendarService.generateInitialCalendar(seed);
        const nodes2 = SeasonCalendarService.generateInitialCalendar(seed);
        
        expect(nodes1).toEqual(nodes2);
    });

    it('generates different nodes for different seeds', () => {
        const nodes1 = SeasonCalendarService.generateInitialCalendar(1);
        const nodes2 = SeasonCalendarService.generateInitialCalendar(2);
        
        expect(nodes1).not.toEqual(nodes2);
    });
});
