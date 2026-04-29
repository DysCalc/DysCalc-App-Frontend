CREATE OR REPLACE FUNCTION create_educator_with_profile(
    p_id UUID,
    p_license_id TEXT,
    p_workplace_name TEXT,
    p_workplace_address TEXT,
    p_undergrad TEXT,
    p_masters TEXT,
    p_doctorate TEXT,
    p_sex TEXT,
    p_date_of_birth DATE,
    p_nickname TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insert educator
    INSERT INTO educator (
        id,
        license_id,
        workplace_name,
        workplace_address,
        undergrad,
        masters,
        doctorate
    )
    VALUES (
        p_id,
        p_license_id,
        p_workplace_name,
        p_workplace_address,
        p_undergrad,
        p_masters,
        p_doctorate
    );

    -- Insert profile
    INSERT INTO profiles (
        id,
        sex,
        date_of_birth,
        nickname
    )
    VALUES (
        p_id,
        p_sex,
        p_date_of_birth,
        p_nickname
    );
END;
$$;

CREATE OR REPLACE FUNCTION update_educator_with_profile(
    p_id UUID,
    p_license_id TEXT,
    p_workplace_name TEXT,
    p_workplace_address TEXT,
    p_undergrad TEXT,
    p_masters TEXT,
    p_doctorate TEXT,
    p_sex TEXT,
    p_date_of_birth DATE,
    p_nickname TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE educator
    SET
        license_id = p_license_id,
        workplace_name = p_workplace_name,
        workplace_address = p_workplace_address,
        undergrad = p_undergrad,
        masters = p_masters,
        doctorate = p_doctorate
    WHERE id = p_id;

    UPDATE profiles
    SET
        sex = p_sex,
        date_of_birth = p_date_of_birth,
        nickname = p_nickname
    WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION delete_educator_with_profile(
    p_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM profiles WHERE id = p_id;
    DELETE FROM educator WHERE id = p_id;
END;
$$;